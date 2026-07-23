(function ($, window) {
  "use strict";

  let FREE_LIMIT = 500000;
  let USAGE_KEY = "landingBuilderGoogleTranslateUsage";
  let API_URL = "https://hiddentagiqr.com:8050/api/app/translation";

  function create(options) {
    let running = false;
    let pendingSingle = null;

    function monthKey() {
      let now = new Date();
      return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    }

    function usage() {
      let result = { month: monthKey(), characters: 0 };
      try {
        let saved = JSON.parse(localStorage.getItem(USAGE_KEY) || "null");
        if (saved && saved.month === result.month)
          result.characters = Math.max(0, Number(saved.characters) || 0);
      } catch (e) {
        /* local usage counter fallback */
      }
      return result;
    }

    function addUsage(characters) {
      let value = usage();
      value.characters = Math.min(
        FREE_LIMIT,
        value.characters + Math.max(0, Number(characters) || 0),
      );
      try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(value));
      } catch (e) {
        /* local usage counter fallback */
      }
      updateUi();
    }

    function status(message, type) {
      $("#translationStatus")
        .removeClass("error success")
        .addClass(type || "")
        .text(message || "");
    }

    function updateUi() {
      let value = usage();
      let reached = value.characters >= FREE_LIMIT;
      let percent = Math.min(100, (value.characters / FREE_LIMIT) * 100);
      let label =
        value.characters.toLocaleString("ko-KR") +
        " / " +
        FREE_LIMIT.toLocaleString("ko-KR") +
        "자";
      let actionLabel = pendingSingle ? "이 문구 번역" : "전체 번역 적용";
      $("#translationUsageText").text(label);
      $("#translationUsageBar").css("width", percent + "%");
      $("#translationUsageBox").toggleClass("limit-reached", reached);
      $("#translationBtn")
        .prop("disabled", reached || running)
        .attr(
          "title",
          reached
            ? "이번 달 무료 번역 한도를 모두 사용했습니다."
            : "랜딩페이지 전체 문구 번역",
        );
      $("#runTranslationBtn")
        .prop("disabled", reached || running)
        .text(running ? "번역 중…" : reached ? "무료 한도 소진" : actionLabel);
      return value;
    }

    function path(section, field, index) {
      return (
        "section:" +
        section.id +
        ":" +
        field +
        (index == null ? "" : ":" + index)
      );
    }

    function collect(template) {
      let entries = [];
      (template.sections || []).forEach(function (section) {
        ["eyebrow", "title", "subtitle", "buttonText"].forEach(function (field) {
          if (typeof section[field] !== "string") return;
          entries.push({
            path: path(section, field),
            value: section[field],
            set: function (value) {
              section[field] = value;
            },
          });
        });
        (section.extraTexts || []).forEach(function (value, index) {
          if (((section.extraTextTypes || [])[index] || "normal") !== "normal") return;
          entries.push({
            path: path(section, "extraTexts", index),
            value: String(value == null ? "" : value),
            set: function (translated) {
              section.extraTexts[index] = translated;
            },
          });
        });
        (section.extraButtons || []).forEach(function (button, index) {
          entries.push({
            path: path(section, "extraButtons", index),
            value: String(button && button.text != null ? button.text : ""),
            set: function (translated) {
              if (section.extraButtons[index])
                section.extraButtons[index].text = translated;
            },
          });
        });
        (section.items || []).forEach(function (value, index) {
          entries.push({
            path: path(section, "items", index),
            value: String(value == null ? "" : value),
            set: function (translated) {
              section.items[index] = translated;
            },
          });
        });
      });
      return entries;
    }

    function prepare(template, sourceLanguage) {
      let entries = collect(template);
      let sourceMarker = sourceLanguage || "auto";
      let meta = template.translationMeta;
      let showingSource =
        !meta || !meta.activeLanguage || meta.activeLanguage === meta.sourceLanguage;
      if (!meta || showingSource) {
        meta = {
          sourceLanguage: sourceMarker,
          activeLanguage: sourceMarker,
          originals: {},
          locales: {},
        };
        entries.forEach(function (entry) {
          meta.originals[entry.path] = entry.value;
        });
        template.translationMeta = meta;
      } else {
        meta.originals = meta.originals || {};
        meta.locales = meta.locales || {};
        entries.forEach(function (entry) {
          if (!Object.prototype.hasOwnProperty.call(meta.originals, entry.path)) {
            meta.originals[entry.path] = entry.value;
            return;
          }
          let original = String(meta.originals[entry.path] == null ? "" : meta.originals[entry.path]);
          let isKnownTranslation = Object.keys(meta.locales).some(function (language) {
            let locale = meta.locales[language] || {};
            return (
              Object.prototype.hasOwnProperty.call(locale, entry.path) &&
              String(locale[entry.path]) === String(entry.value)
            );
          });
          if (String(entry.value) !== original && !isKnownTranslation) {
            meta.originals[entry.path] = entry.value;
            Object.keys(meta.locales).forEach(function (language) {
              delete meta.locales[language][entry.path];
            });
            meta.activeLanguage = "mixed";
          }
        });
      }
      return { entries: entries, meta: meta };
    }

    function restoreOriginals(template) {
      let meta = template && template.translationMeta;
      if (!meta || !meta.originals) return false;
      collect(template).forEach(function (entry) {
        if (Object.prototype.hasOwnProperty.call(meta.originals, entry.path))
          entry.set(meta.originals[entry.path]);
      });
      meta.activeLanguage = meta.sourceLanguage || "auto";
      return true;
    }

    function decode(value) {
      let textarea = document.createElement("textarea");
      textarea.innerHTML = String(value == null ? "" : value);
      return textarea.value;
    }

    function batches(values) {
      let result = [];
      for (let index = 0; index < values.length; index += 2)
        result.push(values.slice(index, index + 2));
      return result;
    }

    function targetCountry(language) {
      return (
        {
          en: "us",
          ja: "jp",
          "zh-CN": "cn",
          vi: "vn",
          th: "th",
          id: "id",
        }[language] || language
      );
    }

    async function request(values, source, target) {
      let body = { user_country: targetCountry(target) };
      if (values[0] != null) body.title = values[0];
      if (values[1] != null) body.content = values[1];
      if (source) body.content_lang = source;
      let response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch (e) {
        payload = null;
      }
      if (!response.ok) {
        let message = payload && (payload.message || payload.error);
        throw new Error(
          (typeof message === "string" && message) ||
            "기존 번역 API 요청에 실패했습니다. (HTTP " +
              response.status +
              ")",
        );
      }
      let data = payload && payload.data;
      if (!data || (values[0] != null && typeof data.title !== "string"))
        throw new Error("기존 번역 API의 응답 형식이 올바르지 않습니다.");
      let translated = [decode(data.title)];
      if (values[1] != null) {
        if (typeof data.content !== "string")
          throw new Error("기존 번역 API의 content 응답이 없습니다.");
        translated.push(decode(data.content));
      }
      return translated;
    }

    function editorPath(section, key) {
      if (!section || !key) return "";
      if (/^extraText\d+$/.test(key))
        return path(
          section,
          "extraTexts",
          Number(key.replace("extraText", "")),
        );
      if (key === "button") return path(section, "buttonText");
      if (/^button\d+$/.test(key))
        return path(
          section,
          "extraButtons",
          Number(key.replace("button", "")) - 1,
        );
      return path(section, key);
    }

    function open(single) {
      pendingSingle = single || null;
      let isSingle = !!pendingSingle;
      let label = isSingle ? pendingSingle.label : "랜딩페이지 번역";
      $("#translationModalTitle").text(isSingle ? label + " 번역" : label);
      $("#translationModalDescription").text(
        isSingle
          ? "선택한 문구만 지정한 언어로 번역합니다."
          : "기존 HiddenTag 번역 API로 랜딩페이지의 텍스트와 버튼 문구를 번역합니다.",
      );
      $("#translationScopeField").prop("hidden", isSingle);
      let template = options.getCurrentTemplate();
      $("#restoreOriginalTextBtn")
        .prop("hidden", isSingle)
        .prop(
          "disabled",
          !(template && template.translationMeta && template.translationMeta.originals),
        );
      status("");
      updateUi();
      $("#translationModal").prop("hidden", false);
    }

    async function runSingle() {
      let item = pendingSingle;
      let source = String($("#translationSourceLanguage").val() || "");
      let target = String($("#translationTargetLanguage").val() || "");
      let value = usage();
      let template = options.getCurrentTemplate();
      let section =
        template &&
        (template.sections || []).find(function (candidate) {
          return candidate.id === item.sectionId;
        });
      if (!item || !section) {
        status("번역할 요소를 찾을 수 없습니다.", "error");
        return;
      }
      if (source && source === target) {
        status("원문 언어와 번역 언어가 같습니다.", "error");
        return;
      }
      let prepared = prepare(template, source);
      let itemPath = editorPath(section, item.key);
      let entry = prepared.entries.find(function (candidate) {
        return candidate.path === itemPath;
      });
      let original = String(
        prepared.meta.originals[itemPath] == null
          ? ""
          : prepared.meta.originals[itemPath],
      );
      let locale = (prepared.meta.locales[target] =
        prepared.meta.locales[target] || {});
      let characters = Array.from(original).length;
      let remaining = FREE_LIMIT - value.characters;
      if (!entry || !original.trim()) {
        status("번역할 문구를 먼저 입력해 주세요.", "error");
        return;
      }
      if (
        !Object.prototype.hasOwnProperty.call(locale, itemPath) &&
        characters > remaining
      ) {
        status("남은 무료 사용량을 초과하는 문구입니다.", "error");
        return;
      }
      running = true;
      updateUi();
      status("선택한 문구를 번역하고 있습니다.");
      try {
        if (!Object.prototype.hasOwnProperty.call(locale, itemPath)) {
          let translated = await request([original], source, target);
          locale[itemPath] = translated[0];
          addUsage(characters);
        }
        options.pushHistory();
        entry.set(locale[itemPath]);
        prepared.meta.activeLanguage = "mixed";
        options.renderAll();
        options.markChanged();
        status("선택한 문구의 번역을 적용했습니다.", "success");
      } catch (error) {
        status(
          error && error.message ? error.message : "번역 중 오류가 발생했습니다.",
          "error",
        );
      } finally {
        running = false;
        updateUi();
      }
    }

    async function runAll() {
      let source = String($("#translationSourceLanguage").val() || "");
      let target = String($("#translationTargetLanguage").val() || "");
      let scope = String($("#translationScope").val() || "current");
      let value = usage();
      if (source && source === target) {
        status("원문 언어와 번역 언어가 같습니다.", "error");
        return;
      }
      let templates = options.getTemplates();
      let targets =
        scope === "all"
          ? Object.keys(templates).map(function (key) {
              return templates[key];
            })
          : [options.getCurrentTemplate()];
      let prepared = targets.map(function (template) {
        return prepare(template, source);
      });
      let pendingByText = Object.create(null);
      let pendingTexts = [];
      prepared.forEach(function (item) {
        let locale = (item.meta.locales[target] = item.meta.locales[target] || {});
        item.entries.forEach(function (entry) {
          let original = String(
            item.meta.originals[entry.path] == null
              ? ""
              : item.meta.originals[entry.path],
          );
          if (
            !original.trim() ||
            Object.prototype.hasOwnProperty.call(locale, entry.path)
          )
            return;
          if (!pendingByText[original]) {
            pendingByText[original] = [];
            pendingTexts.push(original);
          }
          pendingByText[original].push({ meta: item.meta, path: entry.path });
        });
      });
      let requestedCharacters = pendingTexts.reduce(function (total, text) {
        return total + Array.from(text).length;
      }, 0);
      let remaining = FREE_LIMIT - value.characters;
      if (requestedCharacters > remaining) {
        status(
          "이번 요청은 " +
            requestedCharacters.toLocaleString("ko-KR") +
            "자이며 남은 무료 사용량 " +
            remaining.toLocaleString("ko-KR") +
            "자를 초과합니다.",
          "error",
        );
        return;
      }
      running = true;
      updateUi();
      status(
        pendingTexts.length
          ? "번역 요청을 준비하고 있습니다."
          : "저장된 번역을 적용하고 있습니다.",
      );
      try {
        let completed = 0;
        let groups = batches(pendingTexts);
        for (let index = 0; index < groups.length; index++) {
          let group = groups[index];
          let translated = await request(group, source, target);
          let characters = group.reduce(function (total, text) {
            return total + Array.from(text).length;
          }, 0);
          translated.forEach(function (translatedText, translatedIndex) {
            (pendingByText[group[translatedIndex]] || []).forEach(
              function (reference) {
                reference.meta.locales[target][reference.path] = translatedText;
              },
            );
          });
          addUsage(characters);
          completed += group.length;
          status(
            "번역 중… " + completed + " / " + pendingTexts.length + "개 문구",
          );
        }
        options.pushHistory();
        prepared.forEach(function (item) {
          let locale = item.meta.locales[target] || {};
          item.entries.forEach(function (entry) {
            if (Object.prototype.hasOwnProperty.call(locale, entry.path))
              entry.set(locale[entry.path]);
          });
          item.meta.activeLanguage = target;
        });
        options.renderAll();
        options.markChanged();
        status(
          pendingTexts.length
            ? pendingTexts.length + "개 문구의 번역을 적용했습니다."
            : "저장된 번역을 적용했습니다.",
          "success",
        );
      } catch (error) {
        status(
          error && error.message ? error.message : "번역 중 오류가 발생했습니다.",
          "error",
        );
      } finally {
        running = false;
        updateUi();
      }
    }

    return {
      updateUi: updateUi,
      openAll: function () {
        open(null);
      },
      openSingle: function (item) {
        open(item);
      },
      recordEdit: function (section, key, value) {
        let template = options.getCurrentTemplate();
        let meta = template && template.translationMeta;
        if (!meta || !section || !key) return;
        let itemPath = editorPath(section, key);
        meta.originals = meta.originals || {};
        meta.locales = meta.locales || {};
        meta.originals[itemPath] = String(value == null ? "" : value);
        Object.keys(meta.locales).forEach(function (language) {
          delete meta.locales[language][itemPath];
        });
        meta.activeLanguage = "mixed";
      },
      run: async function () {
        if (running) return;
        if (pendingSingle) await runSingle();
        else await runAll();
      },
      restoreCurrent: function () {
        let template = options.getCurrentTemplate();
        if (!template || !template.translationMeta || !template.translationMeta.originals) {
          status("복원할 원문이 없습니다.", "error");
          return false;
        }
        options.mutateWithHistory(function () {
          restoreOriginals(template);
        });
        status("현재 작업을 번역 전 원문으로 복원했습니다.", "success");
        $("#restoreOriginalTextBtn").prop("disabled", false);
        return true;
      },
    };
  }

  window.LandingTranslation = { create: create };
})(jQuery, window);
