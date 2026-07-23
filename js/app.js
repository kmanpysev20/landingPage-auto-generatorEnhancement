(function ($) {
  "use strict";

  function init() {
    state.selectedSectionId = state.templates.beauty.sections[0].id;
    translationController = window.LandingTranslation.create({
      getTemplates: function () {
        return state.templates;
      },
      getCurrentTemplate: currentTemplate,
      pushHistory: pushHistory,
      renderAll: renderAll,
      markChanged: markChanged,
      mutateWithHistory: mutateWithHistory,
    });
    bindEvents();
    $(window).on("resize.deviceFrame", function () {
      requestAnimationFrame(fitDeviceFrameHeight);
    });
    renderSectionTypes();
    renderAll();
    loadLocal();
    renderAll();
  }

  let ASSET = "assets/templates/";
  let DEFAULT_FONT = "'Noto Sans KR', 'Noto Sans', sans-serif";
  let DEFAULT_SECTION_BACKGROUND = "#f2f2ef";
  let DEFAULT_TEXT_COLOR = "#4b5563";
  let DEFAULT_PRODUCT_BUTTON_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23f2f2ef'/%3E%3Crect x='105' y='65' width='110' height='110' rx='12' fill='%23d8d8d3'/%3E%3Ccircle cx='137' cy='101' r='14' fill='%23f2f2ef'/%3E%3Cpath d='M115 158l35-38 24 25 16-17 25 30z' fill='%23f2f2ef'/%3E%3C/svg%3E";
  let RESPONSIVE_BASE_WIDTH = 360;
  let WORKSPACE_PAGE_SIZE = 3;
  let DEFAULT_WORKSPACE_SETUP_VERSION = 1;
  let MIN_CANVAS_ZOOM = 25;
  let MAX_CANVAS_ZOOM = 300;
  let MIN_ELEMENT_SECTION_OVERLAP = 16;
  let SECTION_ELEMENT_SAFE_INSET = 24;
  let MAX_IMAGE_UPLOAD_MB = 15;
  let MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;
  let translationController = null;
  let workspaceCarouselPage = 0;
  let uidSeq = 1;
  function uid(prefix) {
    return (prefix || "s") + "_" + Date.now().toString(36) + "_" + uidSeq++;
  }
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  function safeText(v) {
    return $("<div>")
      .text(v == null ? "" : String(v))
      .html();
  }
  function safeAttr(v) {
    return safeText(v).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function formatScanDate(date) {
    let value = date instanceof Date ? date : new Date(),
      year = value.getFullYear(),
      month = String(value.getMonth() + 1).padStart(2, "0"),
      day = String(value.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }
  function cssUrl(v) {
    return String(v || "").replace(/"/g, "%22");
  }
  let sectionPresets = {
    hero: {
      type: "hero",
      name: "히어로(상단)",
      eyebrow: "여름을 위한",
      title: "벨벳 틴트 립스틱",
      subtitle: "부드럽고 선명한 컬러",
      buttonText: "제품 보러가기",
      buttonImage: "",
      buttonLink: "#products",
      image: ASSET + "beauty-top.jpg",
      visible: true,
    },
    section: {
      type: "section",
      name: "섹션(중단)",
      eyebrow: "NEW ARRIVAL",
      title: "새로운 소식",
      subtitle: "내용을 입력해 주세요.",
      buttonText: "자세히 보기",
      buttonImage: "",
      buttonLink: "#",
      image: ASSET + "beauty-bottom.jpg",
      visible: true,
    },
    footer: {
      type: "footer",
      name: "푸터(하단)",
      title: "© 2026 Brand. All rights reserved.",
      subtitle: "",
      buttonText: "",
      buttonImage: "",
      buttonLink: "#",
      image: "",
      visible: true,
    },
  };
  function createEmptySection(type) {
    let s = clone(sectionPresets[type]);
    s.id = uid("new");
    s.eyebrow = "";
    s.title = "";
    s.subtitle = "";
    s.buttonText = "";
    s.buttonImage = "";
    s.buttonBackgroundImage = "";
    s.buttonLink = "";
    s.buttonContentOrder = "image-text";
    s.buttonContentGap = 0;
    s.buttonType = "normal";
    s.primaryButtonRemoved = false;
    s.image = "";
    s.extraTexts = [];
    s.extraTextClasses = [];
    s.extraTextTags = [];
    s.extraTextTypes = [];
    s.extraButtons = [];
    s.extraImages = [];
    s.extraShapes = [];
    s.positions = {};
    s.elementStyles = {};
    s.customStyle = {
      backgroundColor: DEFAULT_SECTION_BACKGROUND,
    };
    s.deletedTextKeys =
      type === "hero" || type === "section" ? ["title", "subtitle"] : [];
    delete s.imageBrightness;
    delete s.imageWidth;
    delete s.imageHeight;
    delete s.imageFitSectionHeight;
    return s;
  }

  let templates = {
    beauty: {
      id: "beauty",
      name: "MOI",
      short: "MOI",
      dot: "#ef65ad",
      thumb: ASSET + "beauty-thumb.jpg",
      sectionStructureVersion: 2,
      workspaceNameEditableVersion: 1,
      style: {
        main: "#ff7598",
        sub: "#ffe7ed",
        font: DEFAULT_FONT,
        radius: 28,
        overlay: 22,
      },
      sections: [
        $.extend(true, { id: uid("b") }, sectionPresets.hero, {
          title: "벨벳 틴트 립스틱",
          image: ASSET + "beauty-top.jpg",
        }),
        $.extend(true, { id: uid("b") }, sectionPresets.section, {
          title: "신제품 소개",
          subtitle: "여름 시즌 한정 컬러를 만나보세요.",
          image: ASSET + "beauty-bottom.jpg",
        }),
        $.extend(true, { id: uid("b") }, sectionPresets.footer, {
          title: "M.O.I COSMETICS · OFFICIAL LANDING PAGE",
        }),
      ],
    },
    pharma: {
      id: "pharma",
      name: "작업2",
      short: "작업2",
      dot: "#ef65ad",
      thumb: "",
      sectionStructureVersion: 2,
      workspaceNameEditableVersion: 1,
      style: {
        main: "#6841e8",
        sub: DEFAULT_SECTION_BACKGROUND,
        font: DEFAULT_FONT,
        radius: 8,
        overlay: 0,
      },
      sections: [
        createEmptySection("hero"),
        createEmptySection("section"),
        createEmptySection("footer"),
      ],
    },
  };

  let state = {
    activeTemplate: "beauty",
    templates: clone(templates),
    selectedSectionId: null,
    selectedElementKey: null,
    selectedElements: [],
    deviceWidth: 365,
    zoom: 100,
    workspaceSetupVersion: DEFAULT_WORKSPACE_SETUP_VERSION,
    history: [],
    future: [],
  };
  let elementClipboard = null;
  function currentTemplate() {
    return state.templates[state.activeTemplate];
  }
  function currentSection() {
    let sections = currentTemplate().sections;
    for (let i = 0; i < sections.length; i++)
      if (sections[i].id === state.selectedSectionId) return sections[i];
    return null;
  }
  function nextWorkspaceName() {
    let used = Object.keys(state.templates || {}).map(function (key) {
        return String(state.templates[key].name || "").trim();
      }),
      number = 1;
    while (used.indexOf("작업" + number) >= 0) number += 1;
    return "작업" + number;
  }
  function uniqueWorkspaceName(baseName) {
    let used = Object.keys(state.templates || {}).map(function (key) {
        return String(state.templates[key].name || "").trim();
      }),
      base = String(baseName || "작업").trim() || "작업",
      name = base,
      number = 2;
    while (used.indexOf(name) >= 0) name = base + " " + number++;
    return name;
  }
  function randomWorkspaceDotColor(excludedColor) {
    let colors = [
        "#ef65ad",
        "#3f8ee8",
        "#22a06b",
        "#e28a2b",
        "#6841e8",
        "#e05252",
        "#18a6a6",
        "#8d5bb7",
        "#d67b32",
        "#5b7cdb",
      ],
      excluded = String(excludedColor || "").toLowerCase(),
      candidates = colors.filter(function (color) {
        return color.toLowerCase() !== excluded;
      });
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  function activateWorkspace(key) {
    let workspace = state.templates[key];
    if (!workspace) return;
    state.activeTemplate = key;
    state.selectedSectionId = workspace.sections[0].id;
    state.selectedElementKey = null;
    state.selectedElements = [];
    revealWorkspacePage(key);
  }
  function revealWorkspacePage(key) {
    let keys = Object.keys(state.templates || {}),
      index = keys.indexOf(String(key));
    if (index >= 0) workspaceCarouselPage = Math.floor(index / WORKSPACE_PAGE_SIZE);
  }
  function addWorkspace() {
    pushHistory();
    let name = nextWorkspaceName(),
      key = uid("workspace"),
      colors = ["#6841e8", "#ef65ad", "#3f8ee8", "#22a06b", "#e28a2b"],
      index = Object.keys(state.templates).length;
    state.templates[key] = {
      id: key,
      name: name,
      short: name,
      dot: colors[index % colors.length],
      sectionStructureVersion: 2,
      workspaceNameEditableVersion: 1,
      style: {
        main: "#6841e8",
        sub: DEFAULT_SECTION_BACKGROUND,
        font: DEFAULT_FONT,
        radius: 8,
        overlay: 0,
      },
      sections: [
        createEmptySection("hero"),
        createEmptySection("section"),
        createEmptySection("footer"),
      ],
    };
    activateWorkspace(key);
    renderAll();
    markChanged();
    toast(name + "을 추가했습니다.");
  }
  function duplicateWorkspace(sourceKey) {
    let source = state.templates[sourceKey];
    if (!source) return;
    pushHistory();
    let key = uid("workspace"),
      copy = clone(source),
      name = uniqueWorkspaceName((source.name || "작업") + " 복사본");
    copy.id = key;
    copy.name = name;
    copy.short = name;
    copy.dot = randomWorkspaceDotColor(source.dot);
    copy.workspaceNameEditableVersion = 1;
    delete copy.downloadRevision;
    delete copy.downloadRevisionDate;
    delete copy.downloadSignature;
    (copy.sections || []).forEach(function (section) {
      section.id = uid("copy");
    });
    state.templates[key] = copy;
    activateWorkspace(key);
    renderAll();
    markChanged();
    toast((source.name || "작업") + "을 복제했습니다.");
  }
  function deleteWorkspace(key) {
    let keys = Object.keys(state.templates || {}),
      index = keys.indexOf(String(key));
    if (index < 0) return;
    if (keys.length <= 1) {
      toast("최소 1개의 작업은 필요합니다.");
      return;
    }
    pushHistory();
    let removedName = state.templates[key].name || "작업",
      wasActive = key === state.activeTemplate;
    delete state.templates[key];
    if (wasActive) {
      let nextKeys = Object.keys(state.templates),
        nextKey = nextKeys[Math.min(index, nextKeys.length - 1)];
      activateWorkspace(nextKey);
    }
    renderAll();
    markChanged();
    toast(removedName + "을 삭제했습니다.");
  }
  function beginWorkspaceRename(key) {
    let workspace = state.templates[key];
    if (!workspace) return;
    let $name = $('.workspace-tab-name[data-workspace-key="' + key + '"]');
    if (!$name.length) return;
    $name
      .attr("contenteditable", "true")
      .attr("data-original-name", workspace.name || "")
      .attr("data-rename-cancelled", "false")
      .addClass("editing")
      .focus();
    let node = $name[0],
      selection = window.getSelection(),
      range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  function finishWorkspaceRename(element) {
    let $name = $(element),
      key = String($name.attr("data-workspace-key") || ""),
      workspace = state.templates[key];
    if (!workspace || $name.attr("contenteditable") !== "true") return;
    let original = String($name.attr("data-original-name") || workspace.name || ""),
      cancelled = $name.attr("data-rename-cancelled") === "true",
      name = cancelled
        ? original
        : String($name.text() || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 30);
    if (!name) name = original || nextWorkspaceName();
    $name.removeAttr("contenteditable").removeClass("editing");
    if (name === String(workspace.name || "")) {
      renderTabs();
      return;
    }
    pushHistory();
    workspace.name = name;
    workspace.short = name;
    workspace.workspaceNameEditableVersion = 1;
    renderTemplates();
    renderTabs();
    markChanged();
    toast("작업 이름을 변경했습니다.");
  }
  function selectionIndex(sectionId, key) {
    return state.selectedElements.findIndex(function (item) {
      return item.sectionId === sectionId && item.key === key;
    });
  }
  function isElementSelected(sectionId, key) {
    return selectionIndex(sectionId, key) >= 0;
  }
  function syncPrimarySelection(fallbackSectionId) {
    let last = state.selectedElements[state.selectedElements.length - 1];
    state.selectedSectionId = last
      ? last.sectionId
      : fallbackSectionId || state.selectedSectionId;
    state.selectedElementKey = last ? last.key : null;
  }
  function syncElementSelectionClasses() {
    $("#deviceScreen .canvas-movable").each(function () {
      let $el = $(this),
        sectionId = $el.closest(".lp-section").data("section-id"),
        key = $el.data("move-key");
      $el.toggleClass("active-movable", isElementSelected(sectionId, key));
    });
  }
  function selectedEntries() {
    let sections = currentTemplate().sections,
      entries = [];
    state.selectedElements.forEach(function (item) {
      let section = sections.find(function (s) {
        return s.id === item.sectionId;
      });
      if (!section || availableMoveKeys(section).indexOf(item.key) < 0) return;
      let node = null;
      $("#deviceScreen .canvas-movable").each(function () {
        let $el = $(this);
        if (
          $el.closest(".lp-section").data("section-id") === item.sectionId &&
          $el.data("move-key") === item.key
        )
          node = this;
      });
      entries.push({
        section: section,
        sectionId: item.sectionId,
        key: item.key,
        node: node,
      });
    });
    return entries;
  }
  function isResizableElementKey(key) {
    return (
      /^button/.test(key) ||
      key === "image" ||
      /^extraImage/.test(key) ||
      /^shape/.test(key) ||
      ["eyebrow", "title", "subtitle"].indexOf(key) >= 0 ||
      /^extraText/.test(key)
    );
  }
  function positionResizeHandles($handles, node, sectionNode) {
    if (!$handles || !$handles.length || !node || !sectionNode) return;
    let targetRect = node.getBoundingClientRect(),
      sectionRect = sectionNode.getBoundingClientRect();
    let scale = sectionNode.offsetWidth
      ? sectionRect.width / sectionNode.offsetWidth
      : 1;
    scale = scale || 1;
    let left = (targetRect.left - sectionRect.left) / scale,
      right = (targetRect.right - sectionRect.left) / scale;
    let top = (targetRect.top - sectionRect.top) / scale,
      bottom = (targetRect.bottom - sectionRect.top) / scale;
    let centerX = (left + right) / 2,
      centerY = (top + bottom) / 2;
    let points = {
      nw: [left, top],
      n: [centerX, top],
      ne: [right, top],
      e: [right, centerY],
      se: [right, bottom],
      s: [centerX, bottom],
      sw: [left, bottom],
      w: [left, centerY],
    };
    $handles.each(function () {
      let point = points[$(this).attr("data-resize-direction")];
      if (!point) return;
      let x = Math.max(6, Math.min(sectionNode.offsetWidth - 6, point[0]));
      let y = Math.max(6, Math.min(sectionNode.offsetHeight - 6, point[1]));
      $(this).css({ left: x + "px", top: y + "px" });
    });
  }
  function renderResizeHandle() {
    $("#deviceScreen .canvas-resize-handle").remove();
    let entries = selectedEntries().filter(function (entry) {
      return entry.node && isResizableElementKey(entry.key);
    });
    if (!entries.length) return;
    let primary =
      entries.find(function (entry) {
        return (
          entry.sectionId === state.selectedSectionId &&
          entry.key === state.selectedElementKey
        );
      }) || entries[entries.length - 1];
    let sectionNode = $(primary.node).closest(".lp-section")[0];
    if (!sectionNode) return;
    ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach(function (direction) {
      let $handle = $(
        '<button type="button" class="canvas-resize-handle" aria-label="요소 크기 조절" title="드래그: 크기 조절 · Shift: 비율 유지"></button>',
      );
      $handle.attr({
        "data-section-id": primary.sectionId,
        "data-resize-key": primary.key,
        "data-resize-direction": direction,
      });
      $(sectionNode).append($handle);
    });
    positionResizeHandles(
      $(sectionNode).children(".canvas-resize-handle"),
      primary.node,
      sectionNode,
    );
  }
  function snapshot() {
    return JSON.stringify({
      activeTemplate: state.activeTemplate,
      templates: state.templates,
      selectedSectionId: state.selectedSectionId,
      selectedElementKey: state.selectedElementKey,
      selectedElements: state.selectedElements,
      deviceWidth: state.deviceWidth,
      zoom: state.zoom,
      workspaceSetupVersion: state.workspaceSetupVersion,
    });
  }
  function pushHistory() {
    state.history.push(snapshot());
    if (state.history.length > 60) state.history.shift();
    state.future = [];
    updateUndoRedo();
  }
  function restore(serialized) {
    let s = JSON.parse(serialized);
    state.activeTemplate = s.activeTemplate;
    state.templates = s.templates;
    state.selectedSectionId = s.selectedSectionId;
    state.selectedElementKey = s.selectedElementKey || null;
    state.selectedElements = Array.isArray(s.selectedElements)
      ? s.selectedElements
      : [];
    state.deviceWidth = clampDeviceWidth(
      s.deviceWidth || 365,
    );
    state.zoom = clampZoom(s.zoom || 100);
    state.workspaceSetupVersion =
      Number(s.workspaceSetupVersion) || DEFAULT_WORKSPACE_SETUP_VERSION;
    migrateSectionStructures();
    ensureMinimumEditorElements();
    if (
      !currentTemplate().sections.some(function (section) {
        return section.id === state.selectedSectionId;
      })
    )
      state.selectedSectionId = currentTemplate().sections[0].id;
    if (
      !state.selectedElements.length &&
      state.selectedSectionId &&
      state.selectedElementKey
    )
      state.selectedElements = [
        { sectionId: state.selectedSectionId, key: state.selectedElementKey },
      ];
    if (state.selectedElements.length)
      syncPrimarySelection(state.selectedSectionId);
    revealWorkspacePage(state.activeTemplate);
    renderAll();
    saveLocal(false);
  }
  function updateUndoRedo() {
    $("#undoBtn")
      .prop("disabled", !state.history.length)
      .css("opacity", state.history.length ? 1 : 0.35);
    $("#redoBtn")
      .prop("disabled", !state.future.length)
      .css("opacity", state.future.length ? 1 : 0.35);
  }
  function markChanged() {
    $("#saveStateText").text("저장 중…");
    clearTimeout(markChanged.previewTimer);
    markChanged.previewTimer = setTimeout(renderTemplates, 80);
    clearTimeout(markChanged.t);
    markChanged.t = setTimeout(function () {
      saveLocal(true);
    }, 450);
  }
  function saveLocal(show) {
    try {
      localStorage.setItem("landingBuilderV2", snapshot());
    } catch (e) {
      /* file/null origin fallback */
    }
    $("#saveStateText").text("저장됨");
    if (show) toast("변경사항이 자동 저장되었습니다.");
  }
  function loadLocal() {
    let saved = null;
    try {
      saved = localStorage.getItem("landingBuilderV2");
    } catch (e) {
      return;
    }
    if (!saved) return;
    try {
      let savedState = JSON.parse(saved),
        savedTemplates = savedState && savedState.templates,
        savedKeys = savedTemplates ? Object.keys(savedTemplates) : [],
        isLegacyDefaultSet =
          Number(savedState.workspaceSetupVersion || 0) <
            DEFAULT_WORKSPACE_SETUP_VERSION &&
          savedKeys.length === 3 &&
          ["beauty", "pharma", "fashion"].every(function (key) {
            return !!savedTemplates[key];
          });
      if (isLegacyDefaultSet) {
        savedTemplates.beauty.name = "MOI";
        savedTemplates.beauty.short = "MOI";
        savedTemplates.beauty.workspaceNameEditableVersion = 1;
        savedTemplates.pharma = clone(templates.pharma);
        delete savedTemplates.fashion;
        savedState.activeTemplate = "beauty";
        savedState.selectedSectionId = savedTemplates.beauty.sections[0].id;
        savedState.selectedElementKey = null;
        savedState.selectedElements = [];
        savedState.workspaceSetupVersion = DEFAULT_WORKSPACE_SETUP_VERSION;
        saved = JSON.stringify(savedState);
        localStorage.setItem("landingBuilderV2", saved);
      }
      restore(saved);
    } catch (e) {
      console.warn(e);
    }
  }
  function toast(msg) {
    let $t = $("#toast").text(msg).addClass("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () {
      $t.removeClass("show");
    }, 1700);
  }

  function renderAll() {
    renderTemplates();
    renderTabs();
    renderSectionList();
    renderPage();
    renderEditor();
    renderStyle();
    setDevice();
    setZoom();
    updateUndoRedo();
    if (translationController) translationController.updateUi();
  }
  function renderTemplatePreview(t) {
    let html =
      '<div class="template-preview-page lp-page" style="' +
      pageStyle(t, RESPONSIVE_BASE_WIDTH) +
      '">';
    $.each(t.sections || [], function (_, section) {
      if (section.visible !== false)
        html += renderSection(section, false, true);
    });
    return html + "</div>";
  }
  function fitTemplatePreviews() {
    $(".template-thumb").each(function () {
      let preview = $(this).children(".template-preview-page")[0];
      if (!preview) return;
      preview.style.transform = "none";
      let naturalWidth = 365,
        naturalHeight = Math.max(1, preview.scrollHeight);
      preview.style.transform =
        "scale(" +
        this.clientWidth / naturalWidth +
        "," +
        this.clientHeight / naturalHeight +
        ")";
    });
  }
  function renderTemplates() {
    let html = "",
      keys = Object.keys(state.templates || {}),
      pageCount = Math.max(1, Math.ceil(keys.length / WORKSPACE_PAGE_SIZE));
    workspaceCarouselPage = Math.max(0, Math.min(workspaceCarouselPage, pageCount - 1));
    let start = workspaceCarouselPage * WORKSPACE_PAGE_SIZE,
      visibleKeys = keys.slice(start, start + WORKSPACE_PAGE_SIZE);
    $.each(visibleKeys, function (_, key) {
      let t = state.templates[key];
      html +=
        '<button class="template-card ' +
        (key === state.activeTemplate ? "active" : "") +
        '" data-template="' +
        key +
        '">' +
        '<span class="template-check">✓</span><div class="template-thumb">' +
        renderTemplatePreview(t) +
        '</div><div class="template-name">' +
        safeText(t.name) +
        "</div></button>";
    });
    let $grid = $("#templateGrid").html(html);
    $("#templateCarouselNav").prop("hidden", pageCount <= 1);
    $("#templatePageIndicator").text(workspaceCarouselPage + 1 + " / " + pageCount);
    $("#templatePagePrev").prop("disabled", workspaceCarouselPage <= 0);
    $("#templatePageNext").prop("disabled", workspaceCarouselPage >= pageCount - 1);
    requestAnimationFrame(fitTemplatePreviews);
    $grid.find(".template-preview-page img").one("load", fitTemplatePreviews);
  }
  function renderTabs() {
    let html = "",
      canDeleteWorkspace = Object.keys(state.templates || {}).length > 1;
    $.each(state.templates, function (key, t) {
      let deleteTool = canDeleteWorkspace
        ? '<span class="workspace-tab-tool workspace-delete-tool" role="button" tabindex="0" data-delete-workspace="' +
          key +
          '" title="이 작업 삭제" aria-label="이 작업 삭제">×</span>'
        : "";
      html +=
        '<div class="workspace-tab ' +
        (key === state.activeTemplate ? "active" : "") +
        '" role="button" tabindex="0" data-template="' +
        key +
        '" title="이름을 더블클릭하면 수정할 수 있습니다"><span class="tab-dot" style="background:' +
        t.dot +
        '"></span><span class="workspace-tab-name" data-workspace-key="' +
        key +
        '">' +
        safeText(t.short) +
        '</span><span class="workspace-tab-tools"><span class="workspace-tab-tool workspace-name-edit" role="button" tabindex="0" data-edit-workspace="' +
        key +
        '" title="작업 이름 수정" aria-label="작업 이름 수정">✎</span><span class="workspace-tab-tool workspace-duplicate-tool" role="button" tabindex="0" data-duplicate-workspace="' +
        key +
        '" title="이 작업 복제" aria-label="이 작업 복제">⧉</span>' +
        deleteTool +
        "</span>" +
        "</div>";
    });
    html +=
      '<button type="button" class="workspace-tab-action workspace-add-tab" id="addWorkspaceBtn" title="새 작업 추가">＋ 작업</button>';
    $("#workspaceTabs").html(html);
  }
  function renderSectionList() {
    let html = "";
    $.each(currentTemplate().sections, function (i, s) {
      html +=
        '<div class="section-item ' +
        (s.id === state.selectedSectionId ? "active" : "") +
        '" draggable="true" data-id="' +
        s.id +
        '">' +
        '<span class="section-number">' +
        (i + 1) +
        '</span><span class="section-title">' +
        safeText(s.name) +
        "</span>" +
        '<span class="section-tools"><button data-action="toggle" title="표시/숨김">' +
        (s.visible === false ? "○" : "●") +
        '</button><button data-action="duplicate" title="복제">⧉</button><button data-action="delete" title="삭제" aria-label="삭제">×</button></span>' +
        '<span class="section-handle" title="드래그">⋮⋮</span></div>';
    });
    $("#sectionList").html(html);
  }

  function responsiveScale(width) {
    let value = Number(width) || RESPONSIVE_BASE_WIDTH;
    return Math.round((value / RESPONSIVE_BASE_WIDTH) * 10000) / 10000;
  }
  function responsivePx(value) {
    let px = Number(value) || 0;
    return "calc(" + px + "px * var(--responsive-scale, 1))";
  }
  function pageStyle(t, width) {
    return (
      "--brand-main:" +
      t.style.main +
      ";--brand-sub:" +
      t.style.sub +
      ";--button-radius:" +
      t.style.radius +
      "px;--hero-overlay:" +
      t.style.overlay / 100 +
      ";--page-font:" +
      t.style.font +
      ";--responsive-scale:" +
      responsiveScale(width === undefined ? state.deviceWidth : width) +
      ";"
    );
  }
  function gradientCss(style) {
    style = style || {};
    return (
      "linear-gradient(" +
      (style.gradientAngle !== undefined ? Number(style.gradientAngle) : 90) +
      "deg," +
      (style.gradientStart || "#6841e8") +
      "," +
      (style.gradientEnd || "#ff7598") +
      ")"
    );
  }
  function customStyleCss(style, typography, key) {
    style = style || {};
    let css = "";
    let isButton = /^button/.test(key || ""),
      isImage = key === "image" || /^extraImage/.test(key || ""),
      isShape = /^shape/.test(key || ""),
      isText = typography && !isButton && !isImage && !isShape;
    if (typography && style.fontFamily)
      css += "font-family:" + style.fontFamily + ";";
    if (typography && style.fontSize)
      css += "font-size:" + responsivePx(style.fontSize) + ";";
    if (typography && style.fontWeight)
      css += "font-weight:" + Number(style.fontWeight) + ";";
    if (typography && style.lineHeight !== undefined)
      css += "line-height:" + responsivePx(style.lineHeight) + ";";
    if (typography && style.letterSpacing !== undefined)
      css += "letter-spacing:" + responsivePx(style.letterSpacing) + ";";
    if (typography && style.color) css += "color:" + style.color + ";";
    if (style.backgroundColor)
      css += "background-color:" + style.backgroundColor + ";";
    if (style.borderColor) css += "border-color:" + style.borderColor + ";";
    if (style.borderWidth !== undefined)
      css +=
        "border-width:" + Number(style.borderWidth) + "px;border-style:solid;";
    if (style.zIndex !== undefined)
      css += "z-index:" + Math.max(1, Number(style.zIndex) || 1) + ";";
    if (typography && style.borderRadius !== undefined)
      css += "border-radius:" + Number(style.borderRadius) + "px;";
    let filters = [];
    if (style.brightness !== undefined)
      filters.push("brightness(" + Number(style.brightness) + "%)");
    if (style.invertColors) filters.push("invert(1)");
    if (filters.length) css += "filter:" + filters.join(" ") + ";";
    if (typography && style.width !== undefined)
      css +=
        "width:" +
        responsivePx(style.width) +
        ";min-width:0;";
    if (style.height !== undefined)
      css +=
        "height:" +
        (typography || !key
          ? responsivePx(style.height)
          : Number(style.height) + "px") +
        ";min-height:0;";
    if (isImage && style.objectFit) css += "object-fit:" + style.objectFit + ";";
    if (isText && (style.width !== undefined || style.height !== undefined))
      css +=
        "display:inline-flex;align-items:center;justify-content:center;" +
        "box-sizing:border-box;text-align:center;" +
        (style.height !== undefined ? "overflow:hidden;" : "");
    if (style.gradientEnabled) {
      let gradient = gradientCss(style);
      if (isImage) {
        let imageGradient =
          "linear-gradient(" +
          (style.gradientAngle !== undefined
            ? Number(style.gradientAngle)
            : 90) +
          "deg,#000,transparent)";
        css +=
          "-webkit-mask-image:" +
          imageGradient +
          ";mask-image:" +
          imageGradient +
          ";";
      } else if (isButton || isShape || !typography)
        css += "background-image:" + gradient + ";";
      else
        css +=
          "background-image:" +
          gradient +
          ";-webkit-background-clip:text;background-clip:text;color:transparent;";
    }
    if (style.shadowEnabled) {
      let shadow =
        (style.shadowX !== undefined ? Number(style.shadowX) : 0) +
        "px " +
        (style.shadowY !== undefined ? Number(style.shadowY) : 6) +
        "px " +
        Math.max(
          0,
          style.shadowBlur !== undefined ? Number(style.shadowBlur) : 16,
        ) +
        "px " +
        (style.shadowColor || "#000000");
      css +=
        (isButton || isImage || isShape || !typography
          ? "box-shadow:"
          : "text-shadow:") +
        shadow +
        ";";
    }
    if (style.reflectionEnabled)
      css +=
        "-webkit-box-reflect:below " +
        Math.max(
          0,
          style.reflectionGap !== undefined ? Number(style.reflectionGap) : 4,
        ) +
        "px linear-gradient(transparent,rgba(0,0,0,.32));";
    if (
      !typography &&
      (style.rotation !== undefined ||
        style.scale !== undefined ||
        style.flipX ||
        style.flipY)
    ) {
      let scale = Math.max(0.1, Number(style.scale) || 100) / 100;
      css +=
        "transform-origin:center;transform:rotate(" +
        (Number(style.rotation) || 0) +
        "deg) scale(" +
        (style.flipX ? -1 : 1) * scale +
        "," +
        (style.flipY ? -1 : 1) * scale +
        ");";
    }
    return css;
  }
  function sectionAttrs(s, exportMode, extraCss) {
    let attrs = exportMode ? "" : ' data-section-id="' + s.id + '"';
    let css = customStyleCss(s.customStyle, false) + (extraCss || "");
    if (
      (!s.customStyle || s.customStyle.height === undefined) &&
      s.responsiveBaseHeight !== undefined
    )
      css +=
        "height:" +
        responsivePx(Math.max(40, Number(s.responsiveBaseHeight) || 40)) +
        ";min-height:0;";
    return attrs + (css ? ' style="' + safeAttr(css) + '"' : "");
  }
  function getPosition(s, key) {
    s.positions = s.positions || {};
    let p = s.positions[key] || { x: 0, y: 0 };
    return { x: Number(p.x) || 0, y: Number(p.y) || 0 };
  }
  function setPosition(s, key, x, y) {
    s.positions = s.positions || {};
    s.positions[key] = {
      x: Math.round(Number(x) || 0),
      y: Math.round(Number(y) || 0),
    };
  }
  function renderedContainment(node) {
    let sectionNode = $(node).closest(".lp-section")[0];
    if (!sectionNode) return null;
    let rect = node.getBoundingClientRect(),
      sectionRect = sectionNode.getBoundingClientRect(),
      scale = sectionNode.offsetWidth
        ? sectionRect.width / sectionNode.offsetWidth
        : 1;
    scale = scale || 1;
    if (!rect.width || !rect.height || !sectionRect.width || !sectionRect.height)
      return null;
    let left = (rect.left - sectionRect.left) / scale,
      top = (rect.top - sectionRect.top) / scale,
      width = rect.width / scale,
      height = rect.height / scale,
      sectionWidth = sectionRect.width / scale,
      sectionHeight = sectionRect.height / scale;
    let overlapX = Math.min(
        MIN_ELEMENT_SECTION_OVERLAP,
        width,
        sectionWidth,
      ),
      overlapY = Math.min(
        MIN_ELEMENT_SECTION_OVERLAP,
        height,
        sectionHeight,
      ),
      minX = overlapX - left - width,
      maxX = sectionWidth - overlapX - left,
      minY = overlapY - top - height,
      maxY = sectionHeight - overlapY - top;
    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      sectionNode: sectionNode,
    };
  }
  function keepRenderedElementsInsideSections() {
    let changed = false;
    $("#deviceScreen .canvas-movable:visible").each(function () {
      let bounds = renderedContainment(this);
      if (!bounds) return;
      let correctionX = Math.max(bounds.minX, Math.min(bounds.maxX, 0)),
        correctionY = Math.max(bounds.minY, Math.min(bounds.maxY, 0));
      if (Math.abs(correctionX) < 0.25 && Math.abs(correctionY) < 0.25)
        return;
      let sectionId = $(bounds.sectionNode).data("section-id"),
        key = $(this).data("move-key"),
        section = currentTemplate().sections.find(function (item) {
          return String(item.id) === String(sectionId);
        });
      if (!section || !key) return;
      let position = getPosition(section, key),
        x = position.x + correctionX,
        y = position.y + correctionY;
      setPosition(section, key, x, y);
      $(this).css("transform", elementTransform(section, key, x, y));
      changed = true;
    });
    return changed;
  }
  function elementTransform(s, key, x, y, responsiveCoordinates) {
    let style = (s.elementStyles && s.elementStyles[key]) || {};
    let scale = Math.max(0.1, Number(style.scale) || 100) / 100;
    let scaleX = (style.flipX ? -1 : 1) * scale,
      scaleY = (style.flipY ? -1 : 1) * scale;
    let rotation = Number(style.rotation) || 0;
    let coordinateScale = responsiveCoordinates
        ? responsiveScale(state.deviceWidth) || 1
        : 1,
      translateX = responsiveCoordinates
        ? responsivePx((Number(x) || 0) / coordinateScale)
        : Math.round(Number(x) || 0) + "px",
      translateY = responsiveCoordinates
        ? responsivePx((Number(y) || 0) / coordinateScale)
        : Math.round(Number(y) || 0) + "px";
    return (
      "translate(" +
      translateX +
      "," +
      translateY +
      ") rotate(" +
      rotation +
      "deg) scale(" +
      scaleX +
      "," +
      scaleY +
      ")"
    );
  }
  function elementLabel(key) {
    let labels = {
      logo: "로고",
      eyebrow: "상단 문구",
      title: "제목",
      subtitle: "부제목",
      button: "버튼",
      image: "이미지 1",
    };
    if (/^feature/.test(key))
      return "특징 " + (Number(key.replace("feature", "")) + 1);
    if (/^extraText/.test(key))
      return "추가 텍스트 " + (Number(key.replace("extraText", "")) + 1);
    if (/^button\d+$/.test(key))
      return "버튼 " + (Number(key.replace("button", "")) + 1);
    if (/^extraImage\d+$/.test(key))
      return "이미지 " + (Number(key.replace("extraImage", "")) + 2);
    if (/^shape\d+$/.test(key))
      return "도형 " + (Number(key.replace("shape", "")) + 1);
    return labels[key] || key;
  }
  function numberedElementLabel(section, key) {
    if (section) {
      let textFields = sectionTextFields(section),
        textIndex = textFields.findIndex(function (field) {
        return field.key === key;
      });
      if (textIndex >= 0) {
        let textType = textFields[textIndex].textType || "normal";
        if (textType === "srno") return "srno영역";
        if (textType === "scan-count") return "스캔횟수 영역";
        if (textType === "scan-time") return "스캔시간 영역";
        return "텍스트 " + (textIndex + 1);
      }
      let buttonFields = sectionButtons(section),
        buttonIndex = buttonFields.findIndex(function (button) {
          return button.key === key;
        });
      if (buttonIndex >= 0)
        return (
          (buttonFields[buttonIndex].buttonType === "product"
            ? "상품버튼 "
            : "버튼 ") +
          (buttonIndex + 1)
        );
      let shapeIndex = sectionShapes(section).findIndex(function (shape) {
        return shape.key === key;
      });
      if (shapeIndex >= 0) return "도형 " + (shapeIndex + 1);
    }
    if (key === "image") return "이미지 1";
    if (/^extraImage\d+$/.test(key))
      return "이미지 " + (Number(key.replace("extraImage", "")) + 2);
    return elementLabel(key);
  }
  function movableAttrs(s, key, baseClass, exportMode, extraCss) {
    let p = getPosition(s, key);
    let active = !exportMode && isElementSelected(s.id, key);
    let cls =
      baseClass +
      " lp-positioned" +
      (!exportMode ? " canvas-movable" : "") +
      (active ? " active-movable" : "");
    let elementStyle = (s.elementStyles && s.elementStyles[key]) || {};
    let attrs =
      ' class="' +
      cls +
      '" style="transform:' +
      elementTransform(s, key, p.x, p.y, exportMode) +
      ";" +
      safeAttr(customStyleCss(elementStyle, true, key) + (extraCss || "")) +
      '"';
    if (!exportMode)
      attrs +=
        ' data-move-key="' +
        key +
        '" data-move-label="' +
        safeText(numberedElementLabel(s, key)) +
        '"';
    return attrs;
  }
  function sectionControls(s, exportMode) {
    if (exportMode) return "";
    return (
      '<div class="canvas-section-controls"><span class="canvas-section-name">' +
      safeText(s.name) +
      '</span><span class="canvas-section-handle" draggable="true" data-section-drag-handle title="섹션을 위아래로 이동">⋮⋮ 섹션 이동</span></div>'
    );
  }
  function sectionButtons(s) {
    let buttons = [];
    if (!s.primaryButtonRemoved)
      buttons.push({
        key: "button",
        text: s.buttonText || "",
        image: s.buttonImage || "",
        backgroundImage: s.buttonBackgroundImage || "",
        contentOrder: s.buttonContentOrder || "image-text",
        contentGap: Math.max(0, Number(s.buttonContentGap) || 0),
        buttonType: s.buttonType || "normal",
        link: s.buttonLink === undefined ? "#" : s.buttonLink,
        primary: true,
        index: 0,
      });
    (s.extraButtons || []).forEach(function (button, index) {
      buttons.push({
        key: "button" + (index + 1),
        text: button.text || "",
        image: button.image || "",
        backgroundImage: button.backgroundImage || "",
        contentOrder: button.contentOrder || "image-text",
        contentGap: Math.max(0, Number(button.contentGap) || 0),
        buttonType: button.buttonType || "normal",
        link: button.link === undefined ? "#" : button.link,
        primary: false,
        index: index + 1,
      });
    });
    return buttons;
  }
  function normalizedShapeType(type) {
    return ["rectangle", "rounded", "circle", "ellipse", "triangle", "line"].indexOf(
      type,
    ) >= 0
      ? type
      : "rectangle";
  }
  function sectionShapes(s) {
    return (s.extraShapes || []).map(function (shape, index) {
      return {
        key: "shape" + index,
        index: index,
        type: normalizedShapeType(shape && shape.type),
      };
    });
  }
  function shapeDefaultStyle(type) {
    let shapeType = normalizedShapeType(type),
      style = { width: 120, height: 80, backgroundColor: "#6841e8" };
    if (shapeType === "circle") style = { width: 90, height: 90, backgroundColor: "#6841e8" };
    else if (shapeType === "ellipse")
      style = { width: 140, height: 76, backgroundColor: "#6841e8" };
    else if (shapeType === "triangle")
      style = { width: 110, height: 96, backgroundColor: "#6841e8" };
    else if (shapeType === "line")
      style = { width: 150, height: 4, backgroundColor: "#6841e8" };
    return style;
  }
  function migrateSectionStructures() {
    $.each(state.templates || {}, function (key, template) {
      let templateNumber = { beauty: "1", pharma: "2", fashion: "3" }[key];
      if (templateNumber && template.workspaceNameEditableVersion !== 1) {
        template.name = "작업" + templateNumber;
        template.short = "작업" + templateNumber;
        template.workspaceNameEditableVersion = 1;
      }
      (template.sections || []).forEach(function (section) {
        if (section.type === "hero") section.name = "히어로(상단)";
        else if (section.type === "section") section.name = "섹션(중단)";
        else if (section.type === "footer") section.name = "푸터(하단)";
      });
      if (key === "fashion" && template.fontDefaultVersion !== 1) {
        template.style = template.style || {};
        template.style.font = DEFAULT_FONT;
        (template.sections || []).forEach(function (section) {
          if (section.customStyle && section.customStyle.fontFamily)
            section.customStyle.fontFamily = DEFAULT_FONT;
          $.each(section.elementStyles || {}, function (_, elementStyle) {
            if (elementStyle && elementStyle.fontFamily)
              elementStyle.fontFamily = DEFAULT_FONT;
          });
        });
        template.fontDefaultVersion = 1;
      }
      if (template.sectionStructureVersion === 2) return;
      let sections = template.sections || [];
      let oldHero = sections.find(function (s) {
        return s.type === "hero";
      });
      let imageHero = sections.find(function (s) {
        return s.type === "image" && s.image;
      });
      let oldSection =
        sections.find(function (s) {
          return s.type === "section" || s.type === "products";
        }) ||
        sections.find(function (s) {
          return (
            ["certificate", "cta", "features", "image"].indexOf(s.type) >= 0 &&
            s !== imageHero
          );
        });
      let oldFooter = sections.find(function (s) {
        return s.type === "footer";
      });
      let hero = $.extend(
        true,
        { id: uid("hero") },
        sectionPresets.hero,
        oldHero || imageHero || {},
      );
      hero.type = "hero";
      hero.name = "히어로(상단)";
      let content = $.extend(
        true,
        { id: uid("section") },
        sectionPresets.section,
        oldSection || {},
      );
      content.type = "section";
      content.name = "섹션(중단)";
      let footer = $.extend(
        true,
        { id: uid("footer") },
        sectionPresets.footer,
        oldFooter || {},
      );
      footer.type = "footer";
      footer.name = "푸터(하단)";
      template.sections = [hero, content, footer];
      template.sectionStructureVersion = 2;
    });
  }
  function firstBaseTextKey(s) {
    if (s.type === "hero" || s.type === "section") return "eyebrow";
    return "title";
  }
  function clearTextValue(s, key) {
    if (/^feature/.test(key)) {
      s.items = s.items || [];
      s.items[Number(key.replace("feature", ""))] = "";
    } else if (/^extraText/.test(key)) {
      s.extraTexts = s.extraTexts || [];
      s.extraTexts[Number(key.replace("extraText", ""))] = "";
    } else s[key] = "";
  }
  function resetElementData(s, key) {
    s.positions = s.positions || {};
    delete s.positions[key];
    if (s.elementStyles) delete s.elementStyles[key];
  }
  function ensureMinimumEditorElements() {
    $.each(state.templates || {}, function (_, template) {
      (template.sections || []).forEach(function (s) {
        if (!sectionTextFields(s).length) {
          let key = firstBaseTextKey(s);
          s.deletedTextKeys = (s.deletedTextKeys || []).filter(
            function (deletedKey) {
              return deletedKey !== key;
            },
          );
          clearTextValue(s, key);
          resetElementData(s, key);
        }
        if (!sectionButtons(s).length) {
          s.primaryButtonRemoved = false;
          s.buttonText = "";
          s.buttonImage = "";
          s.buttonBackgroundImage = "";
          s.buttonContentOrder = "image-text";
          s.buttonContentGap = 0;
          s.buttonType = "normal";
          s.buttonLink = "#";
          resetElementData(s, "button");
        }
        if (s.image === undefined || s.image === null) s.image = "";
      });
    });
  }
  function isTextAvailable(s, key) {
    return (s.deletedTextKeys || []).indexOf(key) < 0;
  }
  function updateSectionButton(index, field, value) {
    let s = currentSection();
    if (!s) return;
    if (index === 0) {
      if (field === "text") s.buttonText = value;
      else if (field === "image") s.buttonImage = value;
      else if (field === "backgroundImage") s.buttonBackgroundImage = value;
      else if (field === "contentOrder") s.buttonContentOrder = value;
      else if (field === "contentGap")
        s.buttonContentGap = Math.max(0, Math.min(200, Number(value) || 0));
      else s.buttonLink = value;
    } else {
      s.extraButtons = s.extraButtons || [];
      let button = s.extraButtons[index - 1];
      if (!button) return;
      button[field] =
        field === "contentGap"
          ? Math.max(0, Math.min(200, Number(value) || 0))
          : value;
    }
    if (field === "text" && translationController)
      translationController.recordEdit(
        s,
        index === 0 ? "button" : "button" + index,
        value,
      );
    renderPage();
    markChanged();
  }
  function renderButtonContent(button) {
    let image = button.image
      ? '<img class="lp-button-image" src="' +
        safeText(button.image) +
        '" alt="">'
      : "";
    let text = button.text
      ? '<span class="lp-button-text">' + safeText(button.text) + "</span>"
      : "";
    return button.contentOrder === "text-image" ? text + image : image + text;
  }
  function renderSectionButtons(s, exportMode) {
    let html = sectionButtons(s)
      .filter(function (button) {
        return button.text || button.image || button.backgroundImage;
      })
      .map(function (button) {
        let isProduct = button.buttonType === "product",
          useBackgroundImageTag =
            exportMode === "jsp" && !!button.backgroundImage;
        let backgroundCss = button.backgroundImage && !useBackgroundImageTag
          ? 'background-image:url("' +
            cssUrl(button.backgroundImage) +
            '");background-size:cover;background-position:center;background-repeat:no-repeat;'
          : "",
          backgroundImageTag = useBackgroundImageTag
            ? '<img class="lp-button-background-image" src="' +
              safeAttr(button.backgroundImage) +
              '" alt="">'
            : "";
        if (isProduct)
          backgroundCss +=
            "gap:calc(" +
            Math.max(0, Math.min(200, Number(button.contentGap) || 0)) +
            "px * var(--responsive-scale,1));";
        return (
          '<span class="lp-button-slot' +
          (isProduct ? " lp-button-slot-product" : "") +
          '"><a' +
          movableAttrs(
            s,
            button.key,
            "lp-button" + (isProduct ? " lp-product-button" : ""),
            exportMode,
            backgroundCss,
          ) +
          ' href="' +
          safeText(button.link || "#") +
          '">' +
          backgroundImageTag +
          renderButtonContent(button) +
          "</a></span>"
        );
      })
      .join("");
    return html ? '<div class="lp-buttons">' + html + "</div>" : "";
  }
  function renderInlineImage(s, className, exportMode) {
    let brightness =
      s.imageBrightness === undefined ? 100 : Number(s.imageBrightness) || 100;
    let imageStyle = (s.elementStyles && s.elementStyles.image) || {};
    let sizeCss = "";
    if (!s.imageFitSectionHeight) {
      if (s.imageWidth !== undefined)
        sizeCss +=
          "width:" + responsivePx(Math.max(20, Number(s.imageWidth) || 20)) +
          ";max-width:none;";
      if (s.imageHeight !== undefined)
        sizeCss +=
          "height:" + responsivePx(Math.max(20, Number(s.imageHeight) || 20)) +
          ";max-height:none;";
    }
    let filterCss =
      "filter:brightness(" +
      brightness +
      "%)" +
      (imageStyle.invertColors ? " invert(1)" : "") +
      ";";
    return s.image
      ? "<img" +
          movableAttrs(
            s,
            "image",
            className || "lp-element-image",
            exportMode,
            filterCss + sizeCss,
          ) +
          ' src="' +
          safeText(s.image) +
          '" alt="">'
      : "";
  }
  function renderExtraTexts(s, exportMode) {
    let html = "";
    (s.extraTexts || []).forEach(function (value, index) {
      let className = (s.extraTextClasses || [])[index] || "lp-generic-text",
        tagName = (s.extraTextTags || [])[index] || "p",
        textType = (s.extraTextTypes || [])[index] || "normal",
        renderedValue =
          textType === "scan-time"
            ? exportMode === "jsp"
              ? "<%=scanTime%>"
              : safeText(formatScanDate(new Date()))
            : exportMode && textType !== "normal"
              ? String(value || "")
              : safeText(value),
        scanTimeAttr =
          textType === "scan-time" && exportMode !== "jsp"
            ? " data-scan-time"
            : "";
      if (
        ["lp-eyebrow", "lp-title", "lp-subtitle", "lp-footer-text", "lp-generic-text"].indexOf(
          className,
        ) < 0
      )
        className = "lp-generic-text";
      if (textType === "srno") className += " srno";
      else if (textType === "scan-count") className += " scancount";
      else if (textType === "scan-time") className += " scanTime";
      if (exportMode === "jsp" && textType !== "normal") tagName = "div";
      if (["div", "h2", "p", "span"].indexOf(tagName) < 0) tagName = "p";
      html +=
        "<" +
        tagName +
        movableAttrs(s, "extraText" + index, className, exportMode) +
        scanTimeAttr +
        ">" +
        renderedValue +
        "</" +
        tagName +
        ">";
    });
    return html ? '<div class="lp-extra-texts">' + html + "</div>" : "";
  }
  function renderExtraImages(s, exportMode) {
    let html = "";
    (s.extraImages || []).forEach(function (src, index) {
      if (src)
        html +=
          "<img" +
          movableAttrs(s, "extraImage" + index, "lp-extra-image", exportMode) +
          ' src="' +
          safeText(src) +
          '" alt="">';
    });
    return html ? '<div class="lp-extra-images">' + html + "</div>" : "";
  }
  function renderExtraShapes(s, exportMode) {
    let html = sectionShapes(s)
      .map(function (shape) {
        return (
          '<span class="lp-shape-slot lp-shape-slot-' +
          shape.type +
          '"><span' +
          movableAttrs(
            s,
            shape.key,
            "lp-shape lp-shape-" + shape.type,
            exportMode,
          ) +
          ' aria-hidden="true"></span></span>'
        );
      })
      .join("");
    return html ? '<div class="lp-shapes">' + html + "</div>" : "";
  }
  function renderSection(s, selected, exportMode) {
    let cls =
      "lp-section " +
      (selected ? "selected " : "") +
      (s.visible === false ? "hidden-section " : "") +
      (s.imageFitSectionHeight ? "image-fit-section " : "");
    let img = s.image || "",
      controls = sectionControls(s, exportMode);
    if (s.type === "hero") {
      let brightness =
        s.imageBrightness === undefined
          ? 100
          : Number(s.imageBrightness) || 100;
      let sectionGradient =
        s.customStyle && s.customStyle.gradientEnabled
          ? gradientCss(s.customStyle)
          : "";
      if (exportMode === "jsp" && img) {
        let jspBackground =
            '<img class="lp-hero-background" src="' +
            safeAttr(img) +
            '" alt="" style="filter:brightness(' +
            brightness +
            '%)">',
          jspGradient = sectionGradient
            ? '<div class="lp-hero-gradient" style="background-image:' +
              safeAttr(sectionGradient) +
              '"></div>'
            : "";
        return (
          '<section class="' +
          cls +
          'lp-hero"' +
          sectionAttrs(s, exportMode) +
          ">" +
          jspBackground +
          jspGradient +
          controls +
          '<div class="lp-hero-content">' +
          renderExtraShapes(s, exportMode) +
          renderExtraImages(s, exportMode) +
          (isTextAvailable(s, "eyebrow")
            ? "<div" +
              movableAttrs(s, "eyebrow", "lp-eyebrow", exportMode) +
              ">" +
              safeText(s.eyebrow || "") +
              "</div>"
            : "") +
          (isTextAvailable(s, "title")
            ? "<h2" +
              movableAttrs(s, "title", "lp-title", exportMode) +
              ">" +
              safeText(s.title || "") +
              "</h2>"
            : "") +
          (isTextAvailable(s, "subtitle")
            ? "<p" +
              movableAttrs(s, "subtitle", "lp-subtitle", exportMode) +
              ">" +
              safeText(s.subtitle || "") +
              "</p>"
            : "") +
          renderExtraTexts(s, exportMode) +
          renderSectionButtons(s, exportMode) +
          "</div></section>"
        );
      }
      let backgroundLayers = [];
      if (sectionGradient) backgroundLayers.push(sectionGradient);
      if (img) backgroundLayers.push("url('" + cssUrl(img) + "')");
      let background = backgroundLayers.length
        ? '<div class="lp-hero-background" style="background-image:' +
          safeAttr(backgroundLayers.join(",")) +
          ";" +
          (sectionGradient && img ? "background-blend-mode:overlay;" : "") +
          "filter:brightness(" +
          brightness +
          '%)"></div>'
        : "";
      return (
        '<section class="' +
        cls +
        'lp-hero"' +
        sectionAttrs(s, exportMode) +
        ">" +
        background +
        controls +
        '<div class="lp-hero-content">' +
        renderExtraShapes(s, exportMode) +
        renderExtraImages(s, exportMode) +
        (isTextAvailable(s, "eyebrow")
          ? "<div" +
            movableAttrs(s, "eyebrow", "lp-eyebrow", exportMode) +
            ">" +
            safeText(s.eyebrow || "") +
            "</div>"
          : "") +
        (isTextAvailable(s, "title")
          ? "<h2" +
            movableAttrs(s, "title", "lp-title", exportMode) +
            ">" +
            safeText(s.title || "") +
            "</h2>"
          : "") +
        (isTextAvailable(s, "subtitle")
          ? "<p" +
            movableAttrs(s, "subtitle", "lp-subtitle", exportMode) +
            ">" +
            safeText(s.subtitle || "") +
            "</p>"
          : "") +
        renderExtraTexts(s, exportMode) +
        renderSectionButtons(s, exportMode) +
        "</div></section>"
      );
    }
    if (s.type === "section") {
      let imgs = "";
      if (img) {
        imgs =
          '<div class="lp-image-grid">' +
          renderInlineImage(s, "lp-element-image", exportMode) +
          "</div>";
      }
      return (
        '<section class="' +
        cls +
        'lp-content"' +
        sectionAttrs(s, exportMode) +
        ">" +
        controls +
        renderExtraShapes(s, exportMode) +
        renderExtraImages(s, exportMode) +
        (isTextAvailable(s, "eyebrow")
          ? "<div" +
            movableAttrs(s, "eyebrow", "lp-eyebrow", exportMode) +
            ">" +
            safeText(s.eyebrow || "") +
            "</div>"
          : "") +
        (isTextAvailable(s, "title")
          ? "<h2" +
            movableAttrs(s, "title", "lp-title", exportMode) +
            ">" +
            safeText(s.title || "") +
            "</h2>"
          : "") +
        (isTextAvailable(s, "subtitle")
          ? "<p" +
            movableAttrs(s, "subtitle", "lp-subtitle", exportMode) +
            ">" +
            safeText(s.subtitle || "") +
            "</p>"
          : "") +
        renderExtraTexts(s, exportMode) +
        imgs +
        renderSectionButtons(s, exportMode) +
        "</section>"
      );
    }
    if (s.type === "footer")
      return (
        '<footer class="' +
        cls +
        'lp-footer"' +
        sectionAttrs(s, exportMode) +
        ">" +
        controls +
        renderExtraShapes(s, exportMode) +
        renderInlineImage(s, "lp-element-image", exportMode) +
        renderExtraImages(s, exportMode) +
        (isTextAvailable(s, "title")
          ? "<span" +
            movableAttrs(s, "title", "lp-footer-text", exportMode) +
            ">" +
            safeText(s.title || "") +
            "</span>"
          : "") +
        renderExtraTexts(s, exportMode) +
        renderSectionButtons(s, exportMode) +
        "</footer>"
      );
    return "";
  }
  function fitDeviceFrameHeight() {
    let stage = $(".canvas-stage")[0],
      frame = $("#deviceFrame")[0],
      page = $("#deviceScreen .lp-page")[0];
    if (!stage || !frame || !page) return;
    let stageStyle = window.getComputedStyle(stage),
      verticalPadding =
        (parseFloat(stageStyle.paddingTop) || 0) +
        (parseFloat(stageStyle.paddingBottom) || 0),
      availableHeight = Math.max(0, stage.clientHeight - verticalPadding),
      contentHeight = Math.max(1, Math.ceil(page.scrollHeight)),
      frameHeight = availableHeight
        ? Math.min(contentHeight, availableHeight)
        : contentHeight;
    frame.style.height = Math.max(1, frameHeight) + "px";
  }
  function renderPage() {
    let t = currentTemplate(),
      html = '<div class="lp-page" style="' + pageStyle(t) + '">';
    $.each(t.sections, function (_, s) {
      html += renderSection(s, s.id === state.selectedSectionId, false);
    });
    html += "</div>";
    $("#deviceScreen").html(html);
    fitDeviceFrameHeight();
    keepRenderedElementsInsideSections();
    renderResizeHandle();
    $("#deviceScreen img").one("load", function () {
      requestAnimationFrame(function () {
        fitDeviceFrameHeight();
        if (keepRenderedElementsInsideSections()) renderResizeHandle();
      });
    });
    requestAnimationFrame(function () {
      fitDeviceFrameHeight();
      if (keepRenderedElementsInsideSections()) renderResizeHandle();
    });
  }
  function sectionTextFields(s) {
    if (!s) return [];
    let fields = [];
    if (s.type === "hero" || s.type === "section")
      fields = [
        { key: "eyebrow", value: s.eyebrow || "", textType: "normal" },
        { key: "title", value: s.title || "", textType: "normal" },
        { key: "subtitle", value: s.subtitle || "", textType: "normal" },
      ];
    else fields = [{ key: "title", value: s.title || "", textType: "normal" }];
    fields = fields.filter(function (field) {
      return isTextAvailable(s, field.key);
    });
    (s.extraTexts || []).forEach(function (value, index) {
      fields.push({
        key: "extraText" + index,
        value: value || "",
        extra: true,
        index: index,
        textType: (s.extraTextTypes || [])[index] || "normal",
      });
    });
    return fields;
  }
  function updateSectionText(key, value) {
    let s = currentSection();
    if (!s || !key) return;
    let previousValue = "";
    if (/^feature/.test(key)) {
      s.items = s.items || [];
      previousValue = s.items[Number(key.replace("feature", ""))] || "";
      s.items[Number(key.replace("feature", ""))] = value;
    } else if (/^extraText/.test(key)) {
      let index = Number(key.replace("extraText", ""));
      if (!Number.isInteger(index) || index < 0) return;
      s.extraTexts = s.extraTexts || [];
      previousValue = s.extraTexts[index] || "";
      s.extraTexts[index] = value;
    } else {
      let validBaseKeys =
        s.type === "hero" || s.type === "section"
          ? ["eyebrow", "title", "subtitle"]
          : ["title"];
      if (validBaseKeys.indexOf(key) < 0) return;
      s.deletedTextKeys = (s.deletedTextKeys || []).filter(
        function (deletedKey) {
          return deletedKey !== key;
        },
      );
      previousValue = s[key] || "";
      s[key] = value;
    }
    if (translationController) translationController.recordEdit(s, key, value);
    let becameVisible = !previousValue && !!value;
    if (becameVisible) {
      s.elementStyles = s.elementStyles || {};
      s.elementStyles[key] = s.elementStyles[key] || {};
      if (!s.elementStyles[key].color)
        s.elementStyles[key].color = DEFAULT_TEXT_COLOR;
      state.selectedSectionId = s.id;
      state.selectedElementKey = key;
      state.selectedElements = [{ sectionId: s.id, key: key }];
    }
    renderPage();
    renderSectionList();
    if (becameVisible) {
      renderEditorSelectionHighlight(s);
      renderStyle();
    }
    updateCounts();
    markChanged();
  }
  function renderEditor() {
    let s = currentSection();
    if (!s) {
      $("#editorEmpty").show();
      $("#editorFields").prop("hidden", true);
      $("#positionControlGroup").hide();
      return;
    }
    $("#editorEmpty").hide();
    $("#editorFields").prop("hidden", false);
    let fields = sectionTextFields(s);
    if (!fields.length) {
      let fallbackKey = firstBaseTextKey(s);
      s.deletedTextKeys = (s.deletedTextKeys || []).filter(
        function (deletedKey) {
          return deletedKey !== fallbackKey;
        },
      );
      clearTextValue(s, fallbackKey);
      fields = sectionTextFields(s);
    }
    let buttons = sectionButtons(s),
      shapes = sectionShapes(s);
    $("#textControlGroup,#imageControlGroup,#buttonFieldsGroup,#shapeFieldsGroup").show();
    $("#textFieldsList").html(
      fields
        .map(function (field, index) {
          let textType = field.textType || "normal",
            fieldLabel =
              textType === "srno"
                ? "srno영역"
                : textType === "scan-count"
                  ? "스캔횟수 영역"
                  : textType === "scan-time"
                    ? "스캔시간 영역"
                  : "텍스트 " + (index + 1),
            translateButton =
            textType !== "normal"
              ? ""
              : '<button type="button" class="element-translate-button" data-translate-text-key="' +
                field.key +
                '" data-translate-label="' +
                fieldLabel +
                '"' +
                (String(field.value || "").trim() ? "" : " disabled") +
                ">번역</button>";
          return (
            '<div class="element-field-card" data-editor-key="' +
            field.key +
            '"><div class="element-field-head"><strong>' +
            fieldLabel +
            '</strong><span class="element-field-actions">' +
            translateButton +
            '<button type="button" class="element-duplicate-button" data-duplicate-editor-key="' +
            field.key +
            '">복제</button><button type="button" class="element-remove-button" data-remove-text-key="' +
            field.key +
            '">삭제</button></span></div><textarea class="dynamic-text-input" data-text-key="' +
            field.key +
            '"' +
            (textType !== "normal"
              ? ' readonly aria-readonly="true" title="시스템 코드는 수정할 수 없습니다."'
              : "") +
            ' maxlength="120" rows="2">' +
            safeText(
              textType === "scan-time"
                ? formatScanDate(new Date())
                : field.value,
            ) +
            "</textarea></div>"
          );
        })
        .join(""),
    );
    $("#buttonFieldsList").html(
      buttons
        .map(function (button, index) {
          let buttonLabel =
            (button.buttonType === "product" ? "상품버튼 " : "버튼 ") +
            (index + 1);
          return (
            '<div class="element-field-card" data-editor-key="' +
            button.key +
            '"><div class="element-field-head"><strong>' +
            buttonLabel +
            '</strong><span class="element-field-actions"><button type="button" class="element-translate-button" data-translate-button-index="' +
            button.index +
            '" data-translate-label="' +
            buttonLabel +
            '"' +
            (String(button.text || "").trim() ? "" : " disabled") +
            '>번역</button><button type="button" class="element-duplicate-button" data-duplicate-editor-key="' +
            button.key +
            '">복제</button><button type="button" class="element-remove-button" data-remove-button="' +
            button.index +
            '">삭제</button></span></div><label class="field-label">버튼 텍스트</label><input type="text" class="dynamic-button-input" data-button-index="' +
            button.index +
            '" data-button-field="text" maxlength="24" value="' +
            safeAttr(button.text) +
            '"><label class="field-label">콘텐츠 순서</label><select class="dynamic-button-order" data-button-index="' +
            button.index +
            '"><option value="image-text"' +
            (button.contentOrder === "image-text" ? " selected" : "") +
            '>이미지 → 텍스트</option><option value="text-image"' +
            (button.contentOrder === "text-image" ? " selected" : "") +
            '>텍스트 → 이미지</option></select>' +
            (button.buttonType === "product"
              ? '<label class="field-label">이미지와 텍스트 간격</label><input type="number" class="dynamic-button-input" data-button-index="' +
                button.index +
                '" data-button-field="contentGap" min="0" max="200" step="1" value="' +
                Math.max(0, Math.min(200, Number(button.contentGap) || 0)) +
                '">'
              : "") +
            '<label class="field-label">버튼 이미지</label><div class="button-image-control"><div class="button-image-thumb" data-button-thumb="' +
            button.index +
            '"></div><div class="button-image-actions"><label class="upload-button">이미지 선택<input class="dynamic-button-image" data-button-index="' +
            button.index +
            '" type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button type="button" class="text-button" data-remove-button-image="' +
            button.index +
            '">이미지 제거</button></div></div><label class="field-label">버튼 배경 이미지</label><div class="button-image-control"><div class="button-image-thumb button-background-thumb" data-button-background-thumb="' +
            button.index +
            '"></div><div class="button-image-actions"><label class="upload-button">배경 이미지 선택<input class="dynamic-button-background-image" data-button-index="' +
            button.index +
            '" type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button type="button" class="text-button" data-remove-button-background="' +
            button.index +
            '">배경 이미지 제거</button></div></div><label class="field-label">버튼 링크</label><input type="url" class="dynamic-button-input" data-button-index="' +
            button.index +
            '" data-button-field="link" value="' +
            safeAttr(button.link) +
            '" placeholder="https://example.com"></div>'
          );
        })
        .join(""),
    );
    $("#shapeFieldsList").html(
      shapes
        .map(function (shape, index) {
          let options = [
            ["rectangle", "사각형"],
            ["rounded", "둥근 사각형"],
            ["circle", "원"],
            ["ellipse", "타원"],
            ["triangle", "삼각형"],
            ["line", "선"],
          ]
            .map(function (option) {
              return (
                '<option value="' +
                option[0] +
                '"' +
                (shape.type === option[0] ? " selected" : "") +
                ">" +
                option[1] +
                "</option>"
              );
            })
            .join("");
          return (
            '<div class="element-field-card" data-editor-key="' +
            shape.key +
            '"><div class="element-field-head"><strong>도형 ' +
            (index + 1) +
            '</strong><span class="element-field-actions"><button type="button" class="element-duplicate-button" data-duplicate-editor-key="' +
            shape.key +
            '">복제</button><button type="button" class="element-remove-button" data-remove-shape="' +
            index +
            '">삭제</button></span></div><label class="field-label">도형 형태</label><select class="dynamic-shape-type" data-shape-index="' +
            index +
            '">' +
            options +
            "</select></div>"
          );
        })
        .join(""),
    );
    buttons.forEach(function (button) {
      $('#buttonFieldsList [data-button-thumb="' + button.index + '"]').css(
        "background-image",
        button.image ? 'url("' + cssUrl(button.image) + '")' : "none",
      );
      $(
        '#buttonFieldsList [data-button-background-thumb="' +
          button.index +
          '"]',
      ).css(
        "background-image",
        button.backgroundImage
          ? 'url("' + cssUrl(button.backgroundImage) + '")'
          : "none",
      );
    });
    $("#imageThumb").css(
      "background-image",
      s.image ? 'url("' + cssUrl(s.image) + '")' : "none",
    );
    $("#imageUploadLabel").text(s.image ? "이미지 변경" : "이미지 선택");
    $("#removeImageBtn").prop("disabled", !s.image);
    let imageBrightness =
      s.imageBrightness === undefined ? 100 : Number(s.imageBrightness) || 100;
    $("#imageBrightness").val(imageBrightness).prop("disabled", !s.image);
    $("#imageBrightnessOutput").text(imageBrightness + "%");
    $("#resetImageBrightnessBtn").prop(
      "disabled",
      !s.image || imageBrightness === 100,
    );
    let supportsImageSizing = s.type !== "hero";
    $("#imageSizeControl").toggle(supportsImageSizing);
    $("#duplicatePrimaryImageBtn").toggle(!!s.image && supportsImageSizing);
    $("#imageHeight")
      .val(s.imageHeight === undefined ? "" : s.imageHeight)
      .prop("disabled", !s.image || !!s.imageFitSectionHeight);
    $("#imageFitSectionHeight")
      .prop("checked", !!s.imageFitSectionHeight)
      .prop("disabled", !s.image);
    $("#extraImageFieldsList").html(
      (s.extraImages || [])
        .map(function (src, index) {
          return (
            '<div class="element-field-card extra-image-field-card" data-editor-key="extraImage' +
            index +
            '"><div class="element-field-head"><strong>이미지 ' +
            (index + 2) +
            '</strong><span class="element-field-actions"><button type="button" class="element-duplicate-button" data-duplicate-editor-key="extraImage' +
            index +
            '">복제</button><button type="button" class="element-remove-button" data-remove-extra-image="' +
            index +
            '">삭제</button></span></div><div class="image-control-row"><div class="image-thumb" data-extra-image-thumb="' +
            index +
            '"></div><div class="image-actions"><label class="upload-button">이미지 선택<input class="dynamic-extra-image" data-extra-image-index="' +
            index +
            '" type="file" accept="image/png,image/jpeg,image/webp" hidden></label></div></div></div>'
          );
        })
        .join(""),
    );
    (s.extraImages || []).forEach(function (src, index) {
      $('#extraImageFieldsList [data-extra-image-thumb="' + index + '"]').css(
        "background-image",
        src ? 'url("' + cssUrl(src) + '")' : "none",
      );
    });
    $("#imageControlTitle").text("이미지");
    updateCounts();
    renderPositionEditor();
    renderEditorSelectionHighlight(s);
  }
  function renderEditorSelectionHighlight(s) {
    let selectedKeys = state.selectedElements
      .filter(function (item) {
        return item.sectionId === s.id;
      })
      .map(function (item) {
        return item.key;
      });
    $("#editorFields").toggleClass(
      "editor-section-selected",
      !selectedKeys.length && state.selectedSectionId === s.id,
    );
    $("#editorFields [data-editor-key]").each(function () {
      $(this).toggleClass(
        "editor-element-selected",
        selectedKeys.indexOf(String($(this).data("editor-key"))) >= 0,
      );
    });
  }
  function availableMoveKeys(s) {
    if (!s) return [];
    let keys = sectionTextFields(s).map(function (field) {
      return field.key;
    });
    sectionButtons(s).forEach(function (button) {
      if (button.text || button.image || button.backgroundImage)
        keys.push(button.key);
    });
    if (s.type !== "hero" && s.image) keys.push("image");
    (s.extraImages || []).forEach(function (src, index) {
      if (src) keys.push("extraImage" + index);
    });
    sectionShapes(s).forEach(function (shape) {
      keys.push(shape.key);
    });
    return keys;
  }
  function renderPositionEditor() {
    let entries = selectedEntries();
    state.selectedElements = entries.map(function (entry) {
      return { sectionId: entry.sectionId, key: entry.key };
    });
    let s = currentSection(),
      keys = availableMoveKeys(s),
      key = state.selectedElementKey,
      count = entries.length;
    $("#positionControlGroup").toggle(!!keys.length || count > 0);
    $("#headerElementTools").prop("hidden", count < 1);
    $("#multiAlignActions").prop("hidden", count < 1);
    $("#headerMultiAlignTools").prop("hidden", count < 2);
    $("#headerElementToolsLabel").text(
      count > 1 ? count + "개 요소 정렬" : "요소 정렬",
    );
    $("#multiLineAlignGroup").prop("hidden", count < 2);
    $("#gridLayoutGroup").prop("hidden", count < 2);
    $("#elementSpacingGroup").prop("hidden", count < 2);
    if (count >= 2) {
      let columnOptions = [];
      for (let columns = 1; columns <= Math.min(4, count); columns++)
        columnOptions.push(columns);
      if (columnOptions.indexOf(count) < 0) columnOptions.push(count);
      $("#gridLayoutActions").html(
        columnOptions
          .map(function (columns) {
            let rows = Math.ceil(count / columns);
            return (
              '<button type="button" data-grid-columns="' +
              columns +
              '" title="선택 요소를 ' +
              columns +
              '열 ' +
              rows +
              '행으로 배치">' +
              columns +
              "×" +
              rows +
              "</button>"
            );
          })
          .join(""),
      );
    } else $("#gridLayoutActions").empty();
    $("#bringElementToFrontBtn").prop("disabled", count < 1);
    $("#copySelectedElementsBtn").prop("disabled", count < 1);
    $("#pasteElementsBtn").prop(
      "disabled",
      !elementClipboard || !elementClipboard.items.length || !s,
    );
    if (count > 1) {
      $("#selectedMoveLabel").text(count + "개 선택");
      $("#positionHelp").text(
        "묶음을 이동하거나 같은 선에 맞춥니다. 각 요소는 섹션에 최소 16px 이상 걸쳐 있어야 합니다.",
      );
      $("#positionFields").prop("hidden", true);
      $("#resetElementPositionBtn").prop("disabled", false);
      return;
    }
    if (!keys.length) return;
    if (keys.indexOf(key) < 0) {
      state.selectedElementKey = null;
      $("#selectedMoveLabel").text("요소 미선택");
      $("#positionHelp").text(
        "요소를 클릭하고 Ctrl을 누른 채 다른 요소를 클릭하면 다중 선택할 수 있습니다.",
      );
      $("#positionFields").prop("hidden", true);
      $("#resetElementPositionBtn").prop("disabled", true);
      return;
    }
    let p = getPosition(s, key);
    $("#selectedMoveLabel").text(numberedElementLabel(s, key));
    $("#positionHelp").text(
      "섹션 바깥까지 이동할 수 있으며 최소 16px는 섹션에 걸쳐 있어야 합니다. Ctrl을 누르면 선택을 추가합니다.",
    );
    $("#positionFields").prop("hidden", false);
    $("#positionX").val(p.x);
    $("#positionY").val(p.y);
    $("#resetElementPositionBtn").prop("disabled", false);
  }
  function updateCounts() {
    $(".char-count").each(function () {
      let id = $(this).data("for"),
        $f = $("#" + id);
      $(this).text(
        ($f.val() || "").length + " / " + ($f.attr("maxlength") || "—"),
      );
    });
  }
  function colorToHex(value, fallback) {
    if (/^#[0-9a-f]{6}$/i.test(value || "")) return value;
    let match = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return fallback;
    return (
      "#" +
      [match[1], match[2], match[3]]
        .map(function (part) {
          return Number(part).toString(16).padStart(2, "0");
        })
        .join("")
    );
  }
  function normalizeHexColor(value) {
    let text = String(value || "").trim().toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(text))
      return (
        "#" +
        text
          .slice(1)
          .split("")
          .map(function (character) {
            return character + character;
          })
          .join("")
      );
    if (/^#?[0-9a-f]{6}$/.test(text))
      return "#" + text.replace(/^#/, "");
    return null;
  }
  function syncHexColorInputs() {
    $(".hex-color-input[data-color-picker]").each(function () {
      let picker = document.getElementById($(this).data("color-picker"));
      if (!picker) return;
      $(this).val(String(picker.value || "").toLowerCase()).removeClass("invalid");
    });
  }
  function bindNumericStyleInput(selector, field, min, max) {
    $(selector)
      .on("input", function () {
        if (this.value === "") return;
        let value = Number(this.value);
        if (Number.isFinite(value)) applySelectionStyle(field, value);
      })
      .on("change", function () {
        if (this.value === "") {
          renderSelectionStyle();
          return;
        }
        let value = Number(this.value);
        if (!Number.isFinite(value)) {
          renderSelectionStyle();
          return;
        }
        value = Math.max(min, Math.min(max, value));
        this.value = value;
        applySelectionStyle(field, value);
      });
  }
  function minimumSectionHeightForElements(section, sectionNode) {
    let minimumHeight = 40,
      highestElementTop = Infinity,
      lowestElementBottom = -Infinity;
    if (!section) return minimumHeight;
    if (!sectionNode) {
      $("#deviceScreen .lp-section").each(function () {
        if (String($(this).data("section-id")) === String(section.id))
          sectionNode = this;
      });
    }
    if (!sectionNode) return minimumHeight;
    let sectionRect = sectionNode.getBoundingClientRect(),
      canvasScale = sectionNode.offsetWidth
        ? sectionRect.width / sectionNode.offsetWidth
        : 1,
      layoutScale = (canvasScale || 1) * responsiveScale(state.deviceWidth);
    if (!sectionRect.width || !sectionRect.height || !layoutScale)
      return minimumHeight;
    $(sectionNode)
      .find(".canvas-movable:visible")
      .each(function () {
        let rect = this.getBoundingClientRect(),
          elementTop = (rect.top - sectionRect.top) / layoutScale,
          elementBottom = (rect.bottom - sectionRect.top) / layoutScale;
        if (Number.isFinite(elementTop))
          highestElementTop = Math.min(highestElementTop, elementTop);
        if (Number.isFinite(elementBottom))
          lowestElementBottom = Math.max(lowestElementBottom, elementBottom);
      });
    if (Number.isFinite(lowestElementBottom))
      minimumHeight = Math.max(
        minimumHeight,
        Math.ceil(lowestElementBottom + SECTION_ELEMENT_SAFE_INSET),
      );
    if (
      Number.isFinite(highestElementTop) &&
      Number.isFinite(lowestElementBottom)
    ) {
      let elementRange = lowestElementBottom - highestElementTop;
      minimumHeight = Math.max(
        minimumHeight,
        Math.ceil(elementRange + SECTION_ELEMENT_SAFE_INSET * 2),
      );
    }
    return Math.min(3000, minimumHeight);
  }
  function bindSectionHeightInput() {
    let $input = $("#targetSectionHeight");
    function minimumHeight() {
      let target = selectionStyleTargets(),
        first = target.kind === "section" ? target.items[0] : null,
        value = first
          ? minimumSectionHeightForElements(first.section, first.node)
          : 40;
      $input.attr("min", value);
      return value;
    }
    $input
      .on("input", function () {
        if (this.value === "") return;
        let value = Number(this.value),
          min = minimumHeight();
        if (Number.isFinite(value) && value >= min && value <= 3000)
          applySelectionStyle("height", value);
      })
      .on("change", function () {
        let min = minimumHeight();
        if (this.value === "" || !Number.isFinite(Number(this.value))) {
          renderSelectionStyle();
          return;
        }
        let value = Math.max(min, Math.min(3000, Number(this.value)));
        this.value = value;
        applySelectionStyle("height", value);
      });
  }
  function responsiveBaseValue(value) {
    let number = Number(value) || 0;
    return number / responsiveScale(state.deviceWidth);
  }
  function selectionStyleTargets() {
    let entries = selectedEntries().filter(function (entry) {
      return !!entry.node;
    });
    if (entries.length) return { kind: "element", items: entries };
    let section = currentSection();
    if (!section) return { kind: null, items: [] };
    let node = null;
    $("#deviceScreen .lp-section").each(function () {
      if ($(this).data("section-id") === section.id) node = this;
    });
    return { kind: "section", items: [{ section: section, node: node }] };
  }
  function renderSelectionStyle() {
    let target = selectionStyleTargets(),
      $fields = $("#selectionStyleFields");
    if (!target.kind) {
      $("#styleTargetLabel").text("선택 없음");
      $("#styleTargetHelp").text("미리보기에서 섹션 또는 요소를 선택하세요.");
      $fields.prop("hidden", true);
      return;
    }
    let first = target.items[0],
      stored =
        target.kind === "element"
          ? (first.section.elementStyles &&
              first.section.elementStyles[first.key]) ||
            {}
          : first.section.customStyle || {};
    let computed = first.node ? window.getComputedStyle(first.node) : null;
    let showBrightness = target.kind === "section";
    $fields.prop("hidden", false);
    if (target.kind === "element") {
      $("#sectionHeightField").prop("hidden", true);
      $("#elementEffectFields").prop("hidden", false);
      $("#rotationScaleEffectFields").prop("hidden", false);
      let allButtons = target.items.every(function (item) {
        return /^button/.test(item.key);
      });
      let allShapes = target.items.every(function (item) {
        return /^shape/.test(item.key);
      });
      let hasShapes = target.items.some(function (item) {
        return /^shape/.test(item.key);
      });
      showBrightness = allButtons || allShapes;
      let hasImages = target.items.some(function (item) {
        return item.key === "image" || /^extraImage/.test(item.key);
      });
      let allTexts = target.items.every(function (item) {
        return (
           !/^button/.test(item.key) &&
          !/^shape/.test(item.key) &&
          item.key !== "image" &&
          !/^extraImage/.test(item.key)
        );
      });
      $("#typographyStyleFields").toggle(!hasImages && !hasShapes);
      $("#textSizeFields").prop("hidden", !allTexts);
      $("#textRadiusField").prop("hidden", !allTexts);
      $("#styleTargetLabel").text(
        target.items.length > 1
          ? target.items.length + "개 요소"
          : numberedElementLabel(first.section, first.key),
      );
      $("#styleTargetHelp").text(
        target.items.length > 1
          ? "선택한 요소 전체에 같은 스타일을 적용합니다."
          : "선택한 요소에만 스타일을 적용합니다.",
      );
      let weight = String(
        stored.fontWeight || (computed ? computed.fontWeight : 400),
      );
      if (weight === "bold") weight = "700";
      let fontFamily = stored.fontFamily || currentTemplate().style.font;
      $("#targetFontFamily").val(fontFamily);
      $("#targetFontSize").val(
        stored.fontSize !== undefined
          ? stored.fontSize
          : Math.round(
              responsiveBaseValue(
                parseFloat(computed ? computed.fontSize : 14),
              ),
            ) || 14,
      );
      $("#targetFontWeight").val(
        ["300", "400", "500", "600", "700", "800", "900"].indexOf(weight) >= 0
          ? weight
          : "400",
      );
      $("#targetFontColor").val(
        colorToHex(stored.color || (computed ? computed.color : ""), "#17191f"),
      );
      $('[data-clear-style-color="color"]').toggleClass(
        "active",
        !stored.color,
      );
      if (allTexts) {
        $("#targetTextRadius").val(
          stored.borderRadius !== undefined
            ? stored.borderRadius
            : Math.round(parseFloat(computed ? computed.borderRadius : 0)) || 0,
        );
        $("#targetTextWidth").val(
          stored.width !== undefined
            ? stored.width
            : Math.round(
                responsiveBaseValue(
                  first.node ? first.node.offsetWidth : 0,
                ),
              ) || 10,
        );
        $("#targetTextHeight").val(
          stored.height !== undefined
            ? stored.height
            : Math.round(
                responsiveBaseValue(
                  first.node ? first.node.offsetHeight : 0,
                ),
              ) || 10,
        );
      }
      $("#buttonStyleFields").prop("hidden", !(allButtons || allShapes));
      if (allButtons || allShapes) {
        $("#targetButtonWidth").val(
          stored.width !== undefined
            ? stored.width
            : Math.round(
                responsiveBaseValue(
                  parseFloat(computed ? computed.width : 205),
                ),
              ) || 205,
        );
        $("#targetButtonHeight").val(
          stored.height !== undefined
            ? stored.height
            : Math.round(
                responsiveBaseValue(
                  parseFloat(computed ? computed.height : 42),
                ),
              ) || 42,
        );
        $("#targetButtonRadius").val(
          stored.borderRadius !== undefined
            ? stored.borderRadius
            : Math.round(parseFloat(computed ? computed.borderRadius : 0)) || 0,
        );
      }
    } else {
      $("#typographyStyleFields").hide();
      $("#textSizeFields").prop("hidden", true);
      $("#textRadiusField").prop("hidden", true);
      $("#elementEffectFields").prop("hidden", false);
      $("#rotationScaleEffectFields").prop("hidden", true);
      $("#styleTargetLabel").text(first.section.name || "섹션");
      $("#styleTargetHelp").text(
        "선택한 섹션 전체의 효과와 배경, 테두리를 설정합니다.",
      );
      $("#buttonStyleFields").prop("hidden", true);
      $("#sectionHeightField").prop("hidden", false);
      let minimumSectionHeight = minimumSectionHeightForElements(
        first.section,
        first.node,
      );
      $("#targetSectionHeight")
        .attr("min", minimumSectionHeight)
        .val(
          stored.height !== undefined
            ? stored.height
            : Math.round(
                responsiveBaseValue(
                  parseFloat(computed ? computed.height : 0),
                ),
              ) || 40,
        );
    }
    $("#brightnessEffectField").prop("hidden", !showBrightness);
    $("#targetBrightness").val(
      stored.brightness !== undefined ? stored.brightness : 100,
    );
    $("#targetBrightnessOutput").text(
      (stored.brightness !== undefined ? stored.brightness : 100) + "%",
    );
    $("#targetGradientEnabled").prop("checked", !!stored.gradientEnabled);
    $("#gradientEffectOptions").prop("hidden", !stored.gradientEnabled);
    $("#targetGradientStart").val(colorToHex(stored.gradientStart, "#6841e8"));
    $("#targetGradientEnd").val(colorToHex(stored.gradientEnd, "#ff7598"));
    $("#targetGradientAngle").val(
      stored.gradientAngle !== undefined ? stored.gradientAngle : 90,
    );
    $("#targetRotation").val(
      stored.rotation !== undefined ? stored.rotation : 0,
    );
    $("#targetScale").val(stored.scale !== undefined ? stored.scale : 100);
    $("#targetFlipX").prop("checked", !!stored.flipX);
    $("#targetFlipY").prop("checked", !!stored.flipY);
    $("#targetInvertColors").prop("checked", !!stored.invertColors);
    $("#targetShadowEnabled").prop("checked", !!stored.shadowEnabled);
    $("#shadowEffectOptions").prop("hidden", !stored.shadowEnabled);
    $("#targetShadowColor").val(colorToHex(stored.shadowColor, "#000000"));
    $("#targetShadowX").val(stored.shadowX !== undefined ? stored.shadowX : 0);
    $("#targetShadowY").val(stored.shadowY !== undefined ? stored.shadowY : 6);
    $("#targetShadowBlur").val(
      stored.shadowBlur !== undefined ? stored.shadowBlur : 16,
    );
    $("#targetReflectionEnabled").prop("checked", !!stored.reflectionEnabled);
    $("#reflectionEffectOptions").prop("hidden", !stored.reflectionEnabled);
    $("#targetReflectionGap").val(
      stored.reflectionGap !== undefined ? stored.reflectionGap : 4,
    );
    $("#targetBackgroundColor").val(
      colorToHex(
        stored.backgroundColor || (computed ? computed.backgroundColor : ""),
        "#ffffff",
      ),
    );
    $("#targetBorderColor").val(
      colorToHex(
        stored.borderColor || (computed ? computed.borderColor : ""),
        "#dfe2e8",
      ),
    );
    $('[data-clear-style-color="backgroundColor"]').toggleClass(
      "active",
      !stored.backgroundColor || stored.backgroundColor === "transparent",
    );
    $('[data-clear-style-color="borderColor"]').toggleClass(
      "active",
      !stored.borderColor,
    );
    $("#targetBorderWidth").val(
      stored.borderWidth !== undefined
        ? stored.borderWidth
        : Math.round(parseFloat(computed ? computed.borderTopWidth : 0)) || 0,
    );
    syncHexColorInputs();
  }
  function renderStyle() {
    renderSelectionStyle();
  }
  function captureResponsiveSectionHeights() {
    let scale = responsiveScale(state.deviceWidth) || 1;
    $("#deviceScreen .lp-section:visible").each(function () {
      let $section = $(this),
        sectionId = $section.data("section-id"),
        section = currentTemplate().sections.find(function (item) {
          return String(item.id) === String(sectionId);
        });
      if (!section) return;
      let configuredHeight =
          section.customStyle && section.customStyle.height !== undefined
            ? Number(section.customStyle.height)
            : NaN,
        baseHeight = Number.isFinite(configuredHeight)
          ? configuredHeight
          : Number(section.responsiveBaseHeight);
      if (!Number.isFinite(baseHeight) || baseHeight <= 0) {
        let rect = this.getBoundingClientRect(),
          frame = $("#deviceFrame")[0],
          frameRect = frame ? frame.getBoundingClientRect() : null,
          zoomScale =
            frame && frame.offsetWidth && frameRect
              ? frameRect.width / frame.offsetWidth
              : 1;
        baseHeight = rect.height / (zoomScale || 1) / scale;
        if (!Number.isFinite(baseHeight) || baseHeight <= 0) return;
        section.responsiveBaseHeight =
          Math.round(Math.max(40, baseHeight) * 100) / 100;
        baseHeight = section.responsiveBaseHeight;
      }
      $section.css({
        height: responsivePx(Math.max(40, baseHeight)),
        minHeight: 0,
      });
    });
  }
  function captureStableElementAnchors(sectionIds, excludedEntries) {
    let sectionSet = new Set(
        (sectionIds || []).map(function (id) {
          return String(id);
        }),
      ),
      excludedSet = new Set(
        (excludedEntries || []).map(function (entry) {
          return String(entry.sectionId) + "::" + String(entry.key);
        }),
      ),
      anchors = [];
    $("#deviceScreen .canvas-movable:visible").each(function () {
      let $node = $(this),
        sectionNode = $node.closest(".lp-section")[0],
        sectionId = sectionNode
          ? String($(sectionNode).data("section-id"))
          : "",
        key = String($node.data("move-key") || "");
      if (!sectionNode || !key || (sectionSet.size && !sectionSet.has(sectionId)))
        return;
      if (excludedSet.has(sectionId + "::" + key)) return;
      let rect = this.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      anchors.push({
        sectionId: sectionId,
        key: key,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      });
    });
    return anchors;
  }
  function restoreStableElementAnchors(anchors) {
    (anchors || []).forEach(function (anchor) {
      let node = null;
      $("#deviceScreen .canvas-movable").each(function () {
        let $node = $(this),
          sectionId = String($node.closest(".lp-section").data("section-id")),
          key = String($node.data("move-key") || "");
        if (sectionId === anchor.sectionId && key === anchor.key) node = this;
      });
      if (!node) return;
      let sectionNode = $(node).closest(".lp-section")[0],
        section = currentTemplate().sections.find(function (item) {
          return String(item.id) === anchor.sectionId;
        });
      if (!sectionNode || !section) return;
      let rect = node.getBoundingClientRect(),
        sectionRect = sectionNode.getBoundingClientRect(),
        scale = sectionNode.offsetWidth
          ? sectionRect.width / sectionNode.offsetWidth
          : 1;
      scale = scale || 1;
      if (!rect.width || !rect.height) return;
      let position = getPosition(section, anchor.key),
        x = position.x +
          (anchor.centerX - (rect.left + rect.width / 2)) / scale,
        y = position.y +
          (anchor.centerY - (rect.top + rect.height / 2)) / scale;
      setPosition(section, anchor.key, x, y);
      $(node).css("transform", elementTransform(section, anchor.key, x, y));
    });
  }
  function setDevice() {
    state.deviceWidth = clampDeviceWidth(state.deviceWidth);
    $("#deviceWidthInput").val(state.deviceWidth);
    $("#deviceFrame").css("width", state.deviceWidth + "px");
    $("#deviceScreen .lp-page").css(
      "--responsive-scale",
      responsiveScale(state.deviceWidth),
    );
    $("#deviceWidthDownBtn").prop("disabled", state.deviceWidth <= 280);
    $("#deviceWidthUpBtn").prop("disabled", state.deviceWidth >= 1024);
    renderSelectionStyle();
    requestAnimationFrame(function () {
      fitDeviceFrameHeight();
      keepRenderedElementsInsideSections();
      renderResizeHandle();
    });
  }
  function clampDeviceWidth(value) {
    return Math.max(280, Math.min(1024, Math.round(Number(value) || 365)));
  }
  function scaleElementPositionsForDeviceWidth(previousWidth, nextWidth) {
    let previous = Number(previousWidth) || RESPONSIVE_BASE_WIDTH,
      next = Number(nextWidth) || previous,
      ratio = next / previous;
    if (!Number.isFinite(ratio) || ratio <= 0 || Math.abs(ratio - 1) < 0.0001)
      return;
    $.each(state.templates || {}, function (_, template) {
      (template.sections || []).forEach(function (section) {
        $.each(section.positions || {}, function (key, position) {
          if (!position) return;
          section.positions[key] = {
            x: Math.round((Number(position.x) || 0) * ratio * 100) / 100,
            y: Math.round((Number(position.y) || 0) * ratio * 100) / 100,
          };
        });
      });
    });
  }
  function changeDeviceWidth(value) {
    let previousWidth = clampDeviceWidth(state.deviceWidth),
      nextWidth = clampDeviceWidth(value);
    if (previousWidth === nextWidth) {
      setDevice();
      return;
    }
    captureResponsiveSectionHeights();
    scaleElementPositionsForDeviceWidth(previousWidth, nextWidth);
    state.deviceWidth = nextWidth;
    $("#deviceFrame").css("width", nextWidth + "px");
    renderTemplates();
    renderPage();
    setDevice();
    renderPositionEditor();
    markChanged();
  }
  function setZoom() {
    state.zoom = clampZoom(state.zoom);
    $("#deviceFrame").css("transform", "scale(" + state.zoom / 100 + ")");
    $("#zoomValue").text(state.zoom + "%");
    $("#zoomOutBtn").prop("disabled", state.zoom <= MIN_CANVAS_ZOOM);
    $("#zoomInBtn").prop("disabled", state.zoom >= MAX_CANVAS_ZOOM);
    requestAnimationFrame(renderResizeHandle);
  }
  function clampZoom(value) {
    return Math.max(
      MIN_CANVAS_ZOOM,
      Math.min(MAX_CANVAS_ZOOM, Math.round(Number(value) || 100)),
    );
  }
  function changeZoom(value, anchorEvent) {
    let nextZoom = clampZoom(value);
    if (nextZoom === state.zoom) return;
    let stage = $(".canvas-stage")[0],
      frame = $("#deviceFrame")[0],
      beforeRect = stage && frame ? frame.getBoundingClientRect() : null,
      anchorX = anchorEvent ? anchorEvent.clientX : null,
      anchorY = anchorEvent ? anchorEvent.clientY : null,
      ratioX =
        beforeRect && beforeRect.width && anchorX !== null
          ? (anchorX - beforeRect.left) / beforeRect.width
          : 0.5,
      ratioY =
        beforeRect && beforeRect.height && anchorY !== null
          ? (anchorY - beforeRect.top) / beforeRect.height
          : 0.5;
    state.zoom = nextZoom;
    setZoom();
    if (!stage || !frame || !beforeRect || anchorX === null || anchorY === null)
      return;
    requestAnimationFrame(function () {
      let afterRect = frame.getBoundingClientRect();
      stage.scrollLeft += afterRect.left + afterRect.width * ratioX - anchorX;
      stage.scrollTop += afterRect.top + afterRect.height * ratioY - anchorY;
    });
  }
  function selectTemplate(key) {
    if (key === state.activeTemplate) return;
    pushHistory();
    state.activeTemplate = key;
    state.selectedSectionId = currentTemplate().sections[0].id;
    state.selectedElementKey = null;
    state.selectedElements = [];
    revealWorkspacePage(key);
    renderAll();
    markChanged();
  }
  function scrollRightEditorToSelection(key) {
    $(".right-tab").removeClass("active");
    $('.right-tab[data-tab="edit"]').addClass("active");
    $(".right-content").removeClass("active");
    $("#editPanel").addClass("active");
    requestAnimationFrame(function () {
      let $panel = $(".right-panel"),
        $target;
      if (key) {
        $target = $("#editorFields [data-editor-key]")
          .filter(function () {
            return String($(this).data("editor-key")) === String(key);
          })
          .first();
      } else $target = $("#editorFields");
      if (!$panel.length || !$target.length) return;
      let top =
        $panel.scrollTop() + $target.offset().top - $panel.offset().top - 82;
      $panel[0].scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }
  function selectSection(id) {
    state.selectedElementKey = null;
    state.selectedElements = [];
    state.selectedSectionId = id;
    renderSectionList();
    renderPage();
    renderEditor();
    renderStyle();
    scrollRightEditorToSelection(null);
  }
  function clearSelection() {
    if (
      !state.selectedSectionId &&
      !state.selectedElementKey &&
      !state.selectedElements.length
    )
      return;
    state.selectedSectionId = null;
    state.selectedElementKey = null;
    state.selectedElements = [];
    renderSectionList();
    renderPage();
    renderEditor();
    renderStyle();
  }
  function mutateWithHistory(fn) {
    pushHistory();
    fn();
    renderAll();
    markChanged();
  }
  function shiftIndexedElementData(s, prefix, removedIndex, oldLength) {
    s.positions = s.positions || {};
    s.elementStyles = s.elementStyles || {};
    for (let i = removedIndex + 1; i < oldLength; i++) {
      let from = prefix + i,
        to = prefix + (i - 1);
      if (s.positions[from] !== undefined) s.positions[to] = s.positions[from];
      else delete s.positions[to];
      if (s.elementStyles[from] !== undefined)
        s.elementStyles[to] = s.elementStyles[from];
      else delete s.elementStyles[to];
      delete s.positions[from];
      delete s.elementStyles[from];
    }
  }
  function deleteTextElement(s, key) {
    if (
      !sectionTextFields(s).some(function (field) {
        return field.key === key;
      })
    )
      return;
    let isLast = sectionTextFields(s).length <= 1;
    resetElementData(s, key);
    if (isLast) {
      clearTextValue(s, key);
      s.deletedTextKeys = (s.deletedTextKeys || []).filter(
        function (deletedKey) {
          return deletedKey !== key;
        },
      );
    } else if (/^extraText/.test(key)) {
      let index = Number(key.replace("extraText", "")),
        oldLength = (s.extraTexts || []).length;
      s.extraTexts = s.extraTexts || [];
      s.extraTexts.splice(index, 1);
      if (s.extraTextClasses) s.extraTextClasses.splice(index, 1);
      if (s.extraTextTags) s.extraTextTags.splice(index, 1);
      if (s.extraTextTypes) s.extraTextTypes.splice(index, 1);
      shiftIndexedElementData(s, "extraText", index, oldLength);
    } else {
      s.deletedTextKeys = s.deletedTextKeys || [];
      if (s.deletedTextKeys.indexOf(key) < 0) s.deletedTextKeys.push(key);
    }
  }
  function deleteButtonElement(s, key) {
    let button = sectionButtons(s).find(function (item) {
      return item.key === key;
    });
    if (!button) return;
    let index = button.index,
      isLast = sectionButtons(s).length <= 1;
    resetElementData(s, key);
    if (isLast) {
      if (index === 0) {
        s.primaryButtonRemoved = false;
        s.buttonText = "";
        s.buttonImage = "";
        s.buttonBackgroundImage = "";
        s.buttonContentOrder = "image-text";
        s.buttonContentGap = 0;
        s.buttonType = "normal";
        s.buttonLink = "#";
      } else {
        s.extraButtons[index - 1] = {
          text: "",
          image: "",
          backgroundImage: "",
          contentOrder: "image-text",
          contentGap: 0,
          buttonType: "normal",
          link: "#",
        };
      }
    } else if (index === 0) s.primaryButtonRemoved = true;
    else {
      s.extraButtons = s.extraButtons || [];
      let oldLength = s.extraButtons.length;
      s.extraButtons.splice(index - 1, 1);
      shiftIndexedElementData(s, "button", index, oldLength + 1);
    }
  }
  function deleteExtraImageElement(s, key) {
    let index = Number(key.replace("extraImage", "")),
      oldLength = (s.extraImages || []).length;
    if (!Number.isInteger(index) || index < 0 || index >= oldLength) return;
    resetElementData(s, key);
    s.extraImages.splice(index, 1);
    shiftIndexedElementData(s, "extraImage", index, oldLength);
  }
  function deleteShapeElement(s, key) {
    let index = Number(key.replace("shape", "")),
      oldLength = (s.extraShapes || []).length;
    if (!Number.isInteger(index) || index < 0 || index >= oldLength) return;
    resetElementData(s, key);
    s.extraShapes.splice(index, 1);
    shiftIndexedElementData(s, "shape", index, oldLength);
  }
  function remapAnchorKeyAfterDeletion(key, deletedKeys) {
    let indexedPrefixes = ["extraText", "button", "extraImage", "shape"];
    for (let i = 0; i < indexedPrefixes.length; i++) {
      let prefix = indexedPrefixes[i],
        match = String(key).match(new RegExp("^" + prefix + "(\\d+)$"));
      if (!match) continue;
      let oldIndex = Number(match[1]),
        removedBefore = (deletedKeys || []).filter(function (deletedKey) {
          let deletedMatch = String(deletedKey).match(
            new RegExp("^" + prefix + "(\\d+)$"),
          );
          return deletedMatch && Number(deletedMatch[1]) < oldIndex;
        }).length;
      return prefix + (oldIndex - removedBefore);
    }
    return key;
  }
  function deleteSelectedElements(entries) {
    let groups = {};
    entries.forEach(function (entry) {
      groups[entry.sectionId] = groups[entry.sectionId] || {
        section: entry.section,
        keys: [],
      };
      if (groups[entry.sectionId].keys.indexOf(entry.key) < 0)
        groups[entry.sectionId].keys.push(entry.key);
    });
    let stableAnchors = captureStableElementAnchors(
      Object.keys(groups),
      entries,
    );
    stableAnchors.forEach(function (anchor) {
      let group = groups[anchor.sectionId];
      if (group)
        anchor.key = remapAnchorKeyAfterDeletion(anchor.key, group.keys);
    });
    pushHistory();
    $.each(groups, function (_, group) {
        let s = group.section,
          keys = group.keys;
        keys
          .filter(function (key) {
            return /^extraText/.test(key);
          })
          .sort(function (a, b) {
            return (
              Number(b.replace("extraText", "")) -
              Number(a.replace("extraText", ""))
            );
          })
          .forEach(function (key) {
            deleteTextElement(s, key);
          });
        keys
          .filter(function (key) {
            return ["eyebrow", "title", "subtitle"].indexOf(key) >= 0;
          })
          .forEach(function (key) {
            deleteTextElement(s, key);
          });
        keys
          .filter(function (key) {
            return /^button\d+$/.test(key);
          })
          .sort(function (a, b) {
            return (
              Number(b.replace("button", "")) - Number(a.replace("button", ""))
            );
          })
          .forEach(function (key) {
            deleteButtonElement(s, key);
          });
        if (keys.indexOf("button") >= 0) deleteButtonElement(s, "button");
        keys
          .filter(function (key) {
            return /^extraImage/.test(key);
          })
          .sort(function (a, b) {
            return (
              Number(b.replace("extraImage", "")) -
              Number(a.replace("extraImage", ""))
            );
          })
          .forEach(function (key) {
            deleteExtraImageElement(s, key);
          });
        if (keys.indexOf("image") >= 0) {
          s.image = "";
          resetElementData(s, "image");
        }
        keys
          .filter(function (key) {
            return /^shape\d+$/.test(key);
          })
          .sort(function (a, b) {
            return Number(b.replace("shape", "")) - Number(a.replace("shape", ""));
          })
          .forEach(function (key) {
            deleteShapeElement(s, key);
          });
    });
    state.selectedElements = [];
    state.selectedElementKey = null;
    renderAll();
    restoreStableElementAnchors(stableAnchors);
    keepRenderedElementsInsideSections();
    renderResizeHandle();
    markChanged();
  }

  function clipboardItemFromEntry(entry) {
    if (!entry || !entry.node) return null;
    let s = entry.section,
      key = entry.key,
      type = null,
      value = null;
    let textField = sectionTextFields(s).find(function (field) {
      return field.key === key;
    });
    let button = sectionButtons(s).find(function (item) {
      return item.key === key;
    });
    if (textField) {
      type = "text";
      value = textField.value;
    } else if (button) {
      type = "button";
      value = {
        text: button.text,
        image: button.image,
        backgroundImage: button.backgroundImage,
        contentOrder: button.contentOrder,
        contentGap: Math.max(0, Number(button.contentGap) || 0),
        buttonType: button.buttonType || "normal",
        link: button.link,
      };
    } else if (key === "image" || /^extraImage\d+$/.test(key)) {
      type = "image";
      value =
        key === "image"
          ? s.image || ""
          : (s.extraImages || [])[Number(key.replace("extraImage", ""))] || "";
    } else if (/^shape\d+$/.test(key)) {
      let shapeIndex = Number(key.replace("shape", ""));
      type = "shape";
      value = clone((s.extraShapes || [])[shapeIndex] || { type: "rectangle" });
    }
    if (!type || value === null || (type === "image" && !value)) return null;

    let node = entry.node,
      sectionNode = $(node).closest(".lp-section")[0];
    if (!sectionNode) return null;
    let rect = node.getBoundingClientRect(),
      sectionRect = sectionNode.getBoundingClientRect(),
      scale = sectionNode.offsetWidth
        ? sectionRect.width / sectionNode.offsetWidth
        : 1;
    scale = scale || 1;
    let style = clone((s.elementStyles && s.elementStyles[key]) || {});

    if (type === "text") {
      let computed = window.getComputedStyle(node),
        responsive = responsiveScale(state.deviceWidth) || 1;
      style.fontFamily = style.fontFamily || computed.fontFamily || DEFAULT_FONT;
      style.fontSize =
        style.fontSize || Math.round((parseFloat(computed.fontSize) / responsive) * 10) / 10;
      style.fontWeight = style.fontWeight || Number(computed.fontWeight) || 400;
      style.color = style.color || computed.color;
      if (style.width === undefined)
        style.width = Math.round((node.offsetWidth / responsive) * 10) / 10;
      if (style.height === undefined)
        style.height = Math.round((node.offsetHeight / responsive) * 10) / 10;
      if (style.lineHeight === undefined && Number.isFinite(parseFloat(computed.lineHeight)))
        style.lineHeight =
          Math.round((parseFloat(computed.lineHeight) / responsive) * 10) / 10;
      if (
        style.letterSpacing === undefined &&
        Number.isFinite(parseFloat(computed.letterSpacing))
      )
        style.letterSpacing =
          Math.round((parseFloat(computed.letterSpacing) / responsive) * 10) / 10;
    } else if (type === "image") {
      if (style.width === undefined)
        style.width = Math.max(20, Math.round(node.offsetWidth));
      if (style.height === undefined)
        style.height = Math.max(20, Math.round(node.offsetHeight));
      if (key === "image" && style.brightness === undefined)
        style.brightness =
          s.imageBrightness === undefined ? 100 : Number(s.imageBrightness) || 100;
      let imageComputed = window.getComputedStyle(node);
      style.objectFit = style.objectFit || imageComputed.objectFit || "contain";
      if (style.borderRadius === undefined)
        style.borderRadius = parseFloat(imageComputed.borderRadius) || 0;
    }

    let clipboardItem = {
      type: type,
      value: clone(value),
      style: style,
      left: (rect.left - sectionRect.left) / scale,
      top: (rect.top - sectionRect.top) / scale,
    };
    if (type === "text") {
      clipboardItem.textClass =
        ["lp-eyebrow", "lp-title", "lp-subtitle", "lp-footer-text", "lp-generic-text"].find(
          function (className) {
            return $(node).hasClass(className);
          },
        ) || "lp-generic-text";
      clipboardItem.textTag = String(node.tagName || "p").toLowerCase();
      clipboardItem.textType = /^extraText\d+$/.test(key)
        ? (s.extraTextTypes || [])[Number(key.replace("extraText", ""))] || "normal"
        : "normal";
    }
    return clipboardItem;
  }

  function copySelectedElements() {
    let items = selectedEntries()
      .filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      })
      .map(clipboardItemFromEntry)
      .filter(Boolean);
    if (!items.length) return false;
    elementClipboard = { items: items, pasteCount: 0 };
    $("#pasteElementsBtn").prop("disabled", false);
    toast("선택 요소를 복사했습니다. Ctrl+V로 붙여넣을 수 있습니다.");
    return true;
  }

  function appendClipboardItem(s, item) {
    s.elementStyles = s.elementStyles || {};
    s.positions = s.positions || {};
    let key;
    if (item.type === "text") {
      s.extraTexts = s.extraTexts || [];
      let textIndex = s.extraTexts.length;
      key = "extraText" + textIndex;
      s.extraTexts.push(String(item.value == null ? "" : item.value));
      s.extraTextClasses = s.extraTextClasses || [];
      s.extraTextTags = s.extraTextTags || [];
      s.extraTextTypes = s.extraTextTypes || [];
      s.extraTextClasses[textIndex] = item.textClass || "lp-generic-text";
      s.extraTextTags[textIndex] = item.textTag || "p";
      s.extraTextTypes[textIndex] = item.textType || "normal";
    } else if (item.type === "button") {
      s.extraButtons = s.extraButtons || [];
      key = "button" + (s.extraButtons.length + 1);
      s.extraButtons.push(clone(item.value));
    } else if (item.type === "image") {
      s.extraImages = s.extraImages || [];
      key = "extraImage" + s.extraImages.length;
      s.extraImages.push(item.value);
    } else if (item.type === "shape") {
      s.extraShapes = s.extraShapes || [];
      key = "shape" + s.extraShapes.length;
      s.extraShapes.push(clone(item.value));
    } else return null;
    s.elementStyles[key] = clone(item.style || {});
    setPosition(s, key, 0, 0);
    return key;
  }

  function correctPastedElementPositions(s, pasted, offset) {
    let sectionNode = $("#deviceScreen .lp-section")
      .filter(function () {
        return String($(this).data("section-id")) === String(s.id);
      })[0];
    if (!sectionNode) return 0;
    let sectionRect = sectionNode.getBoundingClientRect(),
      scale = sectionNode.offsetWidth
        ? sectionRect.width / sectionNode.offsetWidth
        : 1;
    scale = scale || 1;
    let entries = selectedEntries(),
      largestCorrection = 0;
    pasted.forEach(function (pastedItem) {
      let entry = entries.find(function (candidate) {
        return candidate.key === pastedItem.key;
      });
      if (!entry || !entry.node) return;
      let rect = entry.node.getBoundingClientRect(),
        desiredLeft = sectionRect.left + (pastedItem.item.left + offset) * scale,
        desiredTop = sectionRect.top + (pastedItem.item.top + offset) * scale,
        deltaX = (desiredLeft - rect.left) / scale,
        deltaY = (desiredTop - rect.top) / scale,
        position = getPosition(s, pastedItem.key);
      largestCorrection = Math.max(
        largestCorrection,
        Math.abs(deltaX),
        Math.abs(deltaY),
      );
      setPosition(
        s,
        pastedItem.key,
        position.x + deltaX,
        position.y + deltaY,
      );
    });
    return largestCorrection;
  }

  function pasteElementItems(items, offset, message) {
    let s = currentSection();
    if (!s || !items || !items.length) return false;
    pushHistory();
    let pasted = [];
    items.forEach(function (item) {
      let key = appendClipboardItem(s, item);
      if (key) pasted.push({ key: key, item: item });
    });
    if (!pasted.length) return false;

    state.selectedSectionId = s.id;
    state.selectedElements = pasted.map(function (item) {
      return { sectionId: s.id, key: item.key };
    });
    state.selectedElementKey = pasted[pasted.length - 1].key;
    renderPage();
    correctPastedElementPositions(s, pasted, offset);
    renderAll();
    correctPastedElementPositions(s, pasted, offset);
    renderPage();
    renderEditor();
    renderStyle();
    markChanged();
    toast(message || "요소를 복제했습니다.");
    requestAnimationFrame(function () {
      let stillSelected = pasted.every(function (pastedItem) {
        return selectionIndex(s.id, pastedItem.key) >= 0;
      });
      if (!stillSelected) return;
      if (correctPastedElementPositions(s, pasted, offset) > 0.25) {
        renderPage();
        renderEditor();
        renderStyle();
        markChanged();
      }
    });
    return true;
  }

  function pasteCopiedElements() {
    if (!elementClipboard || !elementClipboard.items.length) return false;
    elementClipboard.pasteCount += 1;
    return pasteElementItems(
      elementClipboard.items,
      elementClipboard.pasteCount * 20,
      "복사한 요소를 붙여넣었습니다.",
    );
  }

  function duplicateEditorElement(key) {
    let s = currentSection();
    if (!s || availableMoveKeys(s).indexOf(key) < 0) return false;
    let node = null;
    $("#deviceScreen .canvas-movable").each(function () {
      let $node = $(this);
      if (
        String($node.closest(".lp-section").data("section-id")) ===
          String(s.id) &&
        String($node.data("move-key")) === String(key)
      )
        node = this;
    });
    let item = clipboardItemFromEntry({
      section: s,
      sectionId: s.id,
      key: key,
      node: node,
    });
    if (!item) return false;
    return pasteElementItems([item], 20, "요소를 복제했습니다.");
  }
  function deleteSectionById(id) {
    let arr = currentTemplate().sections,
      idx = arr.findIndex(function (s) {
        return s.id === id;
      });
    if (idx < 0) return;
    if (arr.length <= 1) {
      toast("최소 1개의 섹션은 필요합니다.");
      return;
    }
    mutateWithHistory(function () {
      arr.splice(idx, 1);
      state.selectedElements = state.selectedElements.filter(function (item) {
        return item.sectionId !== id;
      });
      if (state.selectedSectionId === id) {
        state.selectedSectionId = arr[Math.min(idx, arr.length - 1)].id;
        syncPrimarySelection(state.selectedSectionId);
      }
    });
  }

  function renderedPageCss() {
    let css = "";
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      let href = sheet.href || "";
      if (href && href.indexOf("css/style.css") < 0) return;
      try {
        Array.prototype.forEach.call(sheet.cssRules || [], function (rule) {
          css += rule.cssText + "\n";
        });
      } catch (ignore) {}
    });
    return css;
  }
  function buildStandaloneHtml() {
    captureResponsiveSectionHeights();
    let t = currentTemplate(),
      body = "";
    $.each(t.sections, function (_, s) {
      if (s.visible !== false) body += renderSection(s, false, true);
    });
    let css = renderedPageCss() || $("style#exportStyle").text();
    if (!css) {
      css =
        "*{box-sizing:border-box}html,body{margin:0;min-height:100%}body{background:#fff}.lp-page{--brand-main:" +
        t.style.main +
        ";--brand-sub:" +
        t.style.sub +
        ";--button-radius:" +
        t.style.radius +
        "px;--hero-overlay:" +
        t.style.overlay / 100 +
        ";--page-font:" +
        t.style.font +
        ";min-height:100vh;background:#fff;font-family:var(--page-font);color:#4b5563;max-width:540px;margin:0 auto;box-shadow:0 0 35px rgba(0,0,0,.08)}" +
        '.lp-section{position:relative}.lp-hero{height:620px;background-position:center;background-size:cover;display:flex;align-items:flex-end;justify-content:center;color:#fff;text-align:center;overflow:visible}.lp-hero:before{content:"";position:absolute;inset:0;background:transparent;pointer-events:none}.lp-hero-content{position:relative;z-index:1;padding:0 28px 42px;width:100%}.lp-eyebrow{font-size:15px;font-weight:700;margin-bottom:6px}.lp-title{font-size:34px;line-height:1.13;margin:0;font-weight:900;letter-spacing:-1px}.lp-subtitle{font-size:15px;margin:10px 0 18px;line-height:1.55}.lp-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:220px;min-height:46px;padding:10px 24px;border-radius:var(--button-radius);background:#fff;color:#292d35;text-decoration:none;font-size:14px;font-weight:800;box-shadow:0 7px 20px rgba(0,0,0,.15)}.lp-button-image{width:22px;height:22px;flex:0 0 auto;object-fit:contain}.lp-content{text-align:center;padding:31px 20px;background:var(--brand-sub)}.lp-content .lp-eyebrow{font-size:12px;color:var(--brand-main)}.lp-content .lp-title{font-size:24px}.lp-content .lp-subtitle{font-size:13px;color:#555b66}.lp-image-grid{display:block}.lp-image-grid img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:8px}.lp-footer{padding:22px;text-align:center;background:#111;color:#fff;font-size:12px}.lp-footer-text{display:inline-block}@media(max-width:560px){.lp-page{max-width:none;box-shadow:none}.lp-hero{height:calc(100vh - 100px);min-height:520px}}';
      css +=
        ".lp-hero-background{position:absolute;inset:0;z-index:0;background-position:center;background-size:cover}.lp-hero:before{z-index:1}.lp-hero-content{z-index:2}.lp-element-image{max-width:100%;object-fit:cover}.lp-generic-text{display:block;margin:12px 20px;text-align:center}.lp-extra-texts{text-align:center}.lp-extra-texts .lp-generic-text{margin:8px 0}.lp-extra-images{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin:10px 0}.lp-extra-image{width:64px;height:64px;object-fit:contain}.lp-buttons{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin-top:13px;pointer-events:none}.lp-buttons .lp-button{margin:0}.lp-button-slot{pointer-events:none}.lp-button-slot .lp-button{pointer-events:auto}.lp-button-image{display:inline-block;width:22px;height:22px;margin:0;object-fit:contain}.lp-button-slot-product{width:220px;height:270px}.lp-product-button{width:100%;height:100%;min-width:0;min-height:0;padding:0;gap:0;flex-direction:column;align-items:stretch;justify-content:flex-start;overflow:hidden}.lp-product-button .lp-button-image{display:block;width:100%;height:auto;min-height:0;flex:1 1 auto;object-fit:cover}.lp-product-button .lp-button-text{display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;padding:10px;background:#fff;text-align:center;line-height:1.35;flex:0 0 auto}";
      css +=
        ".lp-content.image-fit-section,.lp-footer.image-fit-section{display:flex;flex-direction:column;overflow:hidden}.lp-content.image-fit-section .lp-image-grid{flex:1 1 0;min-height:0}.lp-content.image-fit-section .lp-image-grid img{width:100%;height:100%;max-height:none;object-fit:cover}.lp-footer.image-fit-section>.lp-element-image{flex:1 1 0;align-self:stretch;width:100%;height:auto;min-height:0;max-height:none;object-fit:cover}";
    }
    css +=
      ".lp-eyebrow,.lp-title,.lp-subtitle,.lp-footer-text,.lp-generic-text{white-space:pre-wrap}.lp-eyebrow{font-size:calc(14px * var(--responsive-scale,1))}.lp-title{font-size:calc(32px * var(--responsive-scale,1))}.lp-subtitle{font-size:calc(14px * var(--responsive-scale,1))}.lp-button-slot{position:relative;display:inline-flex;align-items:center;justify-content:center;width:calc(205px * var(--responsive-scale,1));height:calc(42px * var(--responsive-scale,1));flex:0 0 auto;overflow:visible}.lp-button{gap:calc(8px * var(--responsive-scale,1));min-width:calc(205px * var(--responsive-scale,1));min-height:calc(42px * var(--responsive-scale,1));font-size:calc(13px * var(--responsive-scale,1))}.lp-button-image{width:calc(22px * var(--responsive-scale,1));height:calc(22px * var(--responsive-scale,1))}.lp-generic-text{font-size:calc(14px * var(--responsive-scale,1))}.lp-content .lp-eyebrow{font-size:calc(11px * var(--responsive-scale,1))}.lp-content .lp-title{font-size:calc(21px * var(--responsive-scale,1))}.lp-content .lp-subtitle{font-size:calc(12px * var(--responsive-scale,1))}.lp-footer{font-size:calc(11px * var(--responsive-scale,1))}.lp-button-slot.lp-button-slot-product{width:calc(220px * var(--responsive-scale,1));height:calc(270px * var(--responsive-scale,1))}.lp-button.lp-product-button{width:100%;height:100%;min-width:0;min-height:0;gap:0}";
    css +=
      "html{width:100%;height:100%;overflow:hidden;background:#fff}body{width:100%;height:100%;min-height:0;overflow-x:hidden;overflow-y:auto;background:#fff}.lp-page.export-page{width:" +
      state.deviceWidth +
      "px;max-width:100%;min-height:100vh;margin:0 auto;box-shadow:0 0 35px rgba(0,0,0,.08)}";
    return (
      '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      safeText(t.name) +
      " 랜딩페이지</title><style>" +
      css +
      '</style></head><body><div class="lp-page export-page" style="' +
      pageStyle(t) +
      '">' +
      body +
      '</div><script>(function(){var page=document.querySelector(".lp-page");function syncResponsiveScale(){if(!page)return;var width=Math.max(280,Math.min(1024,page.getBoundingClientRect().width||360));page.style.setProperty("--responsive-scale",String(width/360))}function syncScanDates(){var now=new Date(),date=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");document.querySelectorAll("[data-scan-time]").forEach(function(element){element.textContent=date})}window.addEventListener("resize",syncResponsiveScale);syncResponsiveScale();syncScanDates()})()<\/script></body></html>'
    );
  }
  function openPreview() {
    $("#previewOverlay").prop("hidden", false);
    let doc = $("#previewFrame")[0].contentWindow.document;
    doc.open();
    doc.write(buildStandaloneHtml());
    doc.close();
  }
  function renderedLandingPageCss() {
    let css = renderedPageCss(),
      start = css.indexOf(".lp-page"),
      end = css.indexOf(".modal-backdrop");
    if (start >= 0) css = css.slice(start, end > start ? end : css.length);
    return css;
  }
  function formatCssForDownload(css) {
    let source = String(css || ""),
      output = "",
      indent = 0,
      quote = "",
      escaped = false,
      lineStart = true;
    function write(value) {
      if (lineStart && value !== "\n") {
        output += "  ".repeat(Math.max(0, indent));
        lineStart = false;
      }
      output += value;
      if (value === "\n") lineStart = true;
    }
    function newline() {
      output = output.replace(/[ \t]+$/, "");
      if (!output.endsWith("\n")) output += "\n";
      lineStart = true;
    }
    for (let i = 0; i < source.length; i++) {
      let char = source[i];
      if (quote) {
        write(char);
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === quote) quote = "";
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        write(char);
      } else if (char === "{") {
        write(" {");
        newline();
        indent += 1;
      } else if (char === ";") {
        write(";");
        newline();
      } else if (char === "}") {
        newline();
        indent = Math.max(0, indent - 1);
        write("}");
        newline();
        newline();
      } else if (/\s/.test(char)) {
        if (!lineStart && !/[ \n]$/.test(output)) write(" ");
      } else write(char);
    }
    return output.trim();
  }
  function convertResponsiveValuesForDownload(source) {
    return String(source || "").replace(
      /calc\(\s*(-?\d+(?:\.\d+)?)px\s*\*\s*var\(\s*--responsive-scale\s*(?:,\s*1\s*)?\)\s*\)/g,
      function (_, pixelValue) {
        let viewportValue =
          (Number(pixelValue) / RESPONSIVE_BASE_WIDTH) * 100;
        return (
          String(Math.round(viewportValue * 1000000) / 1000000) + "vw"
        );
      },
    );
  }
  function downloadPageStyle(t) {
    let style = pageStyle(t),
      radius = Math.max(0, Number(t.style.radius) || 0),
      radiusVw = Math.round((radius / RESPONSIVE_BASE_WIDTH) * 100000000) / 1000000;
    return style
      .replace(/--button-radius:[^;]+;/, "--button-radius:" + radiusVw + "vw;")
      .replace(/--responsive-scale:[^;]+;/, "--responsive-scale:1;");
  }
  function encodeBuilderMetadata(payload) {
    let bytes = new TextEncoder().encode(JSON.stringify(payload)),
      binary = "";
    for (let i = 0; i < bytes.length; i += 32768)
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return btoa(binary);
  }
  function decodeBuilderMetadata(encoded) {
    let binary = atob(String(encoded || "").replace(/\s+/g, "")),
      bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  }
  function builderMetadataComment(template, exportVersion) {
    let metadataTemplate = clone(template);
    if (exportVersion) {
      metadataTemplate.downloadRevisionDate = exportVersion.dateCode;
      metadataTemplate.downloadRevision = exportVersion.revision;
      metadataTemplate.downloadSignature = exportVersion.signature;
    }
    let encoded = encodeBuilderMetadata({
        version: 1,
        exportedAt: new Date().toISOString(),
        deviceWidth: state.deviceWidth,
        template: metadataTemplate,
      }),
      lines = encoded.match(/.{1,120}/g) || [];
    return (
      "<%-- LANDING_BUILDER_DATA_V1:\n" + lines.join("\n") + "\n--%>"
    );
  }
  function formatHtmlForDownload(html) {
    let expressions = [],
      protectedHtml = String(html || "").replace(/<%[\s\S]*?%>/g, function (value) {
        let token = "__JSP_EXPRESSION_" + expressions.length + "__";
        expressions.push(value);
        return token;
      }),
      tokens = protectedHtml
        .replace(/>\s*</g, "><")
        .split(/(<[^>]+>)/g)
        .filter(function (token) {
          return String(token).trim() !== "";
        }),
      lines = [],
      indent = 0,
      voidTag = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i;
    tokens.forEach(function (token) {
      token = String(token).trim();
      if (/^<\//.test(token)) indent = Math.max(0, indent - 1);
      lines.push("  ".repeat(indent) + token);
      if (
        /^<[^!/?][^>]*>$/.test(token) &&
        !/\/>$/.test(token) &&
        !voidTag.test(token)
      )
        indent += 1;
    });
    return lines
      .join("\n")
      .replace(/__JSP_EXPRESSION_(\d+)__/g, function (_, index) {
        return expressions[Number(index)] || "";
      });
  }
  function buildJsp(downloadType, exportVersion) {
    captureResponsiveSectionHeights();
    let t = currentTemplate(),
      body = "",
      isFake = downloadType === "fake",
      pageTitle = (t.name || "랜딩페이지") + (isFake ? " 가품인증" : " 정품인증"),
      metadataComment = builderMetadataComment(t, exportVersion);
    $.each(t.sections, function (_, s) {
      if (s.visible !== false) body += renderSection(s, false, "jsp");
    });
    body = formatHtmlForDownload(
      convertResponsiveValuesForDownload(body),
    ).replace(/^/gm, "  ");
    let css = formatCssForDownload(
      convertResponsiveValuesForDownload(
        "*{box-sizing:border-box;list-style:none;margin:0;padding:0;border:none;}" +
          "html,body{width:100%;min-height:100%;background:#fff;}" +
          "body{display:flex;justify-content:center;align-items:flex-start;overflow-x:auto;}" +
          renderedLandingPageCss() +
          ".lp-page.export-page{position:relative;width:100%;max-width:100%;min-width:0;min-height:100vh;flex:1 1 100%;margin:0 auto!important;overflow:hidden;}",
      ),
    );
    return [
      '<%@ page language="java" contentType="text/html; charset=UTF-8"',
      '\tpageEncoding="UTF-8"%>',
      metadataComment,
      '<%',
      '\tString no = request.getParameter("srno");',
      '\tString scancount = request.getParameter("scancnt");',
      '  String index = request.getParameter("index");',
      '  String category = request.getParameter("category");',
      '\tif (scancount != null && !scancount.isEmpty()) {',
      '\t    int count = Integer.parseInt(scancount);',
      '\t    count = count + 1;',
      '\t    scancount = Integer.toString(count);',
      '\t} else {',
      '\t    scancount = "0";',
      '\t}',
      '\tString scanTime = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date());',
      '%>',
      '',
      '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "https://www.w3.org/TR/html4/loose.dtd">',
      '<html>',
      '<head>',
      '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
      '<meta name="robots" content="noindex, nofollow">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
      '<title>' + safeText(pageTitle) + '</title>',
      '<style>',
      css,
      '</style>',
      '</head>',
      '<body>',
      '<div class="lp-page export-page" style="' +
        downloadPageStyle(t) +
        '">',
      body,
      '</div>',
      '</body>',
      '</html>',
    ].join("\n");
  }
  function buildPreviewHtmlFromJsp(jsp) {
    let html = String(jsp || "")
      .replace(/^<%@([\s\S]*?)%>\s*/, "")
      .replace(/^<%--([\s\S]*?)--%>\s*/, "")
      .replace(/^<%([\s\S]*?)%>\s*/, "")
      .replace(/<%=no%>/g, "SRNO-PREVIEW")
      .replace(/<%=scancount\s*%>/g, "0")
      .replace(/<%=scanTime%>/g, formatScanDate(new Date()));
    return html.replace(
      /assets\/templates\/[^\s"'()<>]+/g,
      function (assetPath) {
        try {
          return new URL(assetPath, window.location.href).href;
        } catch (ignore) {
          return assetPath;
        }
      },
    );
  }
  function triggerFileDownload(content, type, filename) {
    let blob = content instanceof Blob ? content : new Blob([content], { type: type }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  }
  function zipCrc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let bit = 0; bit < 8; bit++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function zipHeader(size) {
    return new Uint8Array(size);
  }
  function zipSet16(bytes, offset, value) {
    new DataView(bytes.buffer).setUint16(offset, value, true);
  }
  function zipSet32(bytes, offset, value) {
    new DataView(bytes.buffer).setUint32(offset, value >>> 0, true);
  }
  function zipDosDateTime(date) {
    let value = date instanceof Date ? date : new Date(),
      year = Math.max(1980, value.getFullYear());
    return {
      time:
        (value.getHours() << 11) |
        (value.getMinutes() << 5) |
        Math.floor(value.getSeconds() / 2),
      date:
        ((year - 1980) << 9) |
        ((value.getMonth() + 1) << 5) |
        value.getDate(),
    };
  }
  function createZipBlob(files) {
    let encoder = new TextEncoder(),
      localParts = [],
      centralParts = [],
      localOffset = 0,
      stamp = zipDosDateTime(new Date());
    (files || []).forEach(function (file) {
      let isDirectory = /\/$/.test(String(file.name || "")),
        nameBytes = encoder.encode(String(file.name || "file.txt")),
        dataBytes =
          file.content instanceof Uint8Array
            ? file.content
            : file.content instanceof ArrayBuffer
              ? new Uint8Array(file.content)
              : encoder.encode(String(file.content || "")),
        crc = zipCrc32(dataBytes),
        localHeader = zipHeader(30),
        centralHeader = zipHeader(46);

      zipSet32(localHeader, 0, 0x04034b50);
      zipSet16(localHeader, 4, 20);
      zipSet16(localHeader, 6, 0x0800);
      zipSet16(localHeader, 8, 0);
      zipSet16(localHeader, 10, stamp.time);
      zipSet16(localHeader, 12, stamp.date);
      zipSet32(localHeader, 14, crc);
      zipSet32(localHeader, 18, dataBytes.length);
      zipSet32(localHeader, 22, dataBytes.length);
      zipSet16(localHeader, 26, nameBytes.length);
      zipSet16(localHeader, 28, 0);
      localParts.push(localHeader, nameBytes, dataBytes);

      zipSet32(centralHeader, 0, 0x02014b50);
      zipSet16(centralHeader, 4, 20);
      zipSet16(centralHeader, 6, 20);
      zipSet16(centralHeader, 8, 0x0800);
      zipSet16(centralHeader, 10, 0);
      zipSet16(centralHeader, 12, stamp.time);
      zipSet16(centralHeader, 14, stamp.date);
      zipSet32(centralHeader, 16, crc);
      zipSet32(centralHeader, 20, dataBytes.length);
      zipSet32(centralHeader, 24, dataBytes.length);
      zipSet16(centralHeader, 28, nameBytes.length);
      zipSet16(centralHeader, 30, 0);
      zipSet16(centralHeader, 32, 0);
      zipSet16(centralHeader, 34, 0);
      zipSet16(centralHeader, 36, 0);
      zipSet32(centralHeader, 38, isDirectory ? 0x10 : 0);
      zipSet32(centralHeader, 42, localOffset);
      centralParts.push(centralHeader, nameBytes);

      localOffset += localHeader.length + nameBytes.length + dataBytes.length;
    });
    let centralSize = centralParts.reduce(function (total, part) {
        return total + part.length;
      }, 0),
      end = zipHeader(22);
    zipSet32(end, 0, 0x06054b50);
    zipSet16(end, 4, 0);
    zipSet16(end, 6, 0);
    zipSet16(end, 8, files.length);
    zipSet16(end, 10, files.length);
    zipSet32(end, 12, centralSize);
    zipSet32(end, 16, localOffset);
    zipSet16(end, 20, 0);
    return new Blob(localParts.concat(centralParts, [end]), {
      type: "application/zip",
    });
  }
  function templateImageSources(template) {
    let sources = [];
    function add(source) {
      source = String(source || "").trim();
      if (source && sources.indexOf(source) < 0) sources.push(source);
    }
    (template.sections || []).forEach(function (section) {
      add(section.image);
      add(section.buttonImage);
      add(section.buttonBackgroundImage);
      (section.extraImages || []).forEach(add);
      (section.extraButtons || []).forEach(function (button) {
        add(button.image);
        add(button.backgroundImage);
      });
    });
    return sources;
  }
  function imageExtension(blobType, source) {
    let type = String(blobType || "").toLowerCase(),
      matches = String(source || "").match(/\.([a-z0-9]{2,5})(?:[?#].*)?$/i),
      sourceExtension = matches ? matches[1].toLowerCase() : "",
      extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/avif": "avif",
        "image/bmp": "bmp",
      };
    return extensions[type] || sourceExtension || "png";
  }
  function uniqueImageFilename(source, blobType, number, usedNames) {
    let baseName = "";
    if (!/^data:|^blob:/i.test(source)) {
      try {
        baseName = decodeURIComponent(
          new URL(source, window.location.href).pathname.split("/").pop() || "",
        );
      } catch (ignore) {}
    }
    baseName = baseName
      .replace(/[?#].*$/, "")
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    let extension = imageExtension(blobType, source);
    if (!baseName) baseName = "image-" + String(number).padStart(2, "0");
    if (!/\.[a-z0-9]{2,5}$/i.test(baseName)) baseName += "." + extension;
    let dotIndex = baseName.lastIndexOf("."),
      stem = dotIndex > 0 ? baseName.slice(0, dotIndex) : baseName,
      suffix = dotIndex > 0 ? baseName.slice(dotIndex) : "." + extension,
      candidate = baseName,
      duplicate = 2;
    while (usedNames[candidate.toLowerCase()])
      candidate = stem + "-" + duplicate++ + suffix;
    usedNames[candidate.toLowerCase()] = true;
    return candidate;
  }
  function replaceImageSource(markup, source, replacement) {
    let variants = [source, safeText(source), safeAttr(source)];
    variants.forEach(function (variant) {
      if (variant) markup = markup.split(variant).join(replacement);
    });
    return markup;
  }
  async function bundleLandingImages(jsp, template) {
    let markup = String(jsp || ""),
      files = [],
      failures = 0,
      usedNames = {},
      sources = templateImageSources(template);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      try {
        let url = /^data:|^blob:/i.test(source)
            ? source
            : new URL(source, window.location.href).href,
          response = await fetch(url);
        if (!response.ok) throw new Error("image fetch failed");
        let blob = await response.blob();
        if (!/^image\//i.test(blob.type || "image/unknown"))
          throw new Error("not an image");
        let filename = uniqueImageFilename(
            source,
            blob.type,
            i + 1,
            usedNames,
          ),
          zipPath = "img/" + filename,
          bytes = new Uint8Array(await blob.arrayBuffer());
        files.push({ name: zipPath, content: bytes });
        markup = replaceImageSource(markup, source, zipPath);
      } catch (ignore) {
        failures += 1;
      }
    }
    return { jsp: markup, files: files, failures: failures };
  }
  function workspaceZipFilename() {
    let name = String(currentTemplate().name || "landing")
      .replace(/\s*(랜딩페이지|랜딩|landing\s*page|landing)\s*$/i, "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
      .trim();
    return name ? name + "landing.zip" : "landing.zip";
  }
  function downloadDateCode() {
    let now = new Date(),
      year = String(now.getFullYear()).slice(-2),
      month = String(now.getMonth() + 1).padStart(2, "0"),
      day = String(now.getDate()).padStart(2, "0");
    return year + month + day;
  }
  function templateDownloadSignature(template) {
    let serialized = JSON.stringify(template, function (key, value) {
        if (
          key === "downloadRevision" ||
          key === "downloadRevisionDate" ||
          key === "downloadSignature"
        )
          return undefined;
        return value;
      }),
      hash = 2166136261;
    for (let i = 0; i < serialized.length; i++) {
      hash ^= serialized.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16) + ":" + serialized.length;
  }
  function pendingDownloadVersion(template) {
    let dateCode = downloadDateCode(),
      signature = templateDownloadSignature(template),
      sameDate = String(template.downloadRevisionDate || "") === dateCode,
      revision = sameDate
        ? Math.max(1, Number(template.downloadRevision) || 1)
        : 1;
    if (
      sameDate &&
      template.downloadSignature &&
      template.downloadSignature !== signature
    )
      revision += 1;
    return {
      dateCode: dateCode,
      revision: revision,
      signature: signature,
    };
  }
  function commitDownloadVersion(template, version) {
    template.downloadRevisionDate = version.dateCode;
    template.downloadRevision = version.revision;
    template.downloadSignature = version.signature;
    saveLocal(false);
  }
  function extractBuilderMetadata(jspSource) {
    let match = String(jspSource || "").match(
      /<%--\s*LANDING_BUILDER_DATA_V1:\s*([A-Za-z0-9+/=\s]+?)\s*--%>/,
    );
    if (!match) throw new Error("builder metadata not found");
    let payload = decodeBuilderMetadata(match[1]);
    if (
      !payload ||
      payload.version !== 1 ||
      !payload.template ||
      !Array.isArray(payload.template.sections) ||
      !payload.template.sections.length ||
      !payload.template.style
    )
      throw new Error("invalid builder metadata");
    return payload;
  }
  async function importJspFile(file) {
    if (!file) return;
    let source = await file.text(),
      payload = extractBuilderMetadata(source),
      imported = clone(payload.template),
      key = uid("workspace"),
      importedName = uniqueWorkspaceName(
        String(imported.name || "가져온 작업").trim() || "가져온 작업",
      );
    pushHistory();
    imported.id = key;
    imported.name = importedName;
    imported.short = importedName;
    imported.workspaceNameEditableVersion = 1;
    (imported.sections || []).forEach(function (section) {
      section.id = uid("import");
    });
    state.templates[key] = imported;
    activateWorkspace(key);
    state.deviceWidth = clampDeviceWidth(payload.deviceWidth || 365);
    migrateSectionStructures();
    ensureMinimumEditorElements();
    imported.downloadSignature = templateDownloadSignature(imported);
    renderAll();
    markChanged();
    toast(importedName + " 작업물을 가져왔습니다.");
  }
  function downloadFileStem(version) {
    version = version || pendingDownloadVersion(currentTemplate());
    return (
      "landing000_" +
      version.dateCode +
      String(version.revision).padStart(2, "0")
    );
  }
  function openDownloadTypeModal() {
    captureResponsiveSectionHeights();
    let stem = downloadFileStem(pendingDownloadVersion(currentTemplate()));
    $('#downloadTypeModal [data-download-type="authentic"] small').text(
      stem + ".jsp",
    );
    $('#downloadTypeModal [data-download-type="fake"] small').text(
      stem + ".expire.jsp",
    );
    $("#downloadTypeModal").prop("hidden", false);
  }
  async function downloadJsp(downloadType) {
    captureResponsiveSectionHeights();
    let isFake = downloadType === "fake",
      template = currentTemplate(),
      downloadVersion = pendingDownloadVersion(template),
      jsp = buildJsp(
        isFake ? "fake" : "authentic",
        downloadVersion,
      ),
      fileStem = downloadFileStem(downloadVersion),
      jspFilename = isFake ? fileStem + ".expire.jsp" : fileStem + ".jsp",
      previewFilename = isFake
        ? fileStem + ".expire.preview.html"
        : fileStem + ".preview.html",
      zipFilename = workspaceZipFilename();
    $("[data-download-type]").prop("disabled", true);
    toast("이미지를 포함한 ZIP 파일을 생성하고 있습니다.");
    try {
      let bundle = await bundleLandingImages(jsp, template),
        previewHtml = buildPreviewHtmlFromJsp(bundle.jsp),
        zipFiles = [
          { name: jspFilename, content: bundle.jsp },
          { name: previewFilename, content: previewHtml },
          { name: "img/", content: new Uint8Array(0) },
        ].concat(bundle.files),
        zip = createZipBlob(zipFiles);
      triggerFileDownload(zip, "application/zip", zipFilename);
      commitDownloadVersion(template, downloadVersion);
      $("#downloadTypeModal").prop("hidden", true);
      toast(
        (isFake ? "가품" : "정품") +
          " JSP, 미리보기 HTML, 이미지 " +
          bundle.files.length +
          "개를 ZIP으로 다운로드했습니다." +
          (bundle.failures ? " 불러오지 못한 이미지가 있습니다." : ""),
      );
    } catch (error) {
      toast("ZIP 파일을 생성하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      $("[data-download-type]").prop("disabled", false);
    }
  }
  function applySelectionStyle(field, value) {
    let target = selectionStyleTargets();
    if (!target.kind) return;
    let layoutAffectingFields = [
        "width",
        "height",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "borderWidth",
      ],
      shouldPreserveElementAnchors =
        (target.kind === "element" &&
          layoutAffectingFields.indexOf(field) >= 0) ||
        (target.kind === "section" && field === "height"),
      stableAnchors = shouldPreserveElementAnchors
        ? captureStableElementAnchors(
            target.items.map(function (item) {
              return item.sectionId !== undefined
                ? item.sectionId
                : item.section && item.section.id;
            }),
          )
        : [];
    target.items.forEach(function (item) {
      if (target.kind === "element") {
        item.section.elementStyles = item.section.elementStyles || {};
        item.section.elementStyles[item.key] =
          item.section.elementStyles[item.key] || {};
        if (value === null) delete item.section.elementStyles[item.key][field];
        else item.section.elementStyles[item.key][field] = value;
      } else {
        item.section.customStyle = item.section.customStyle || {};
        if (value === null) delete item.section.customStyle[field];
        else item.section.customStyle[field] = value;
      }
    });
    renderPage();
    if (stableAnchors.length) {
      restoreStableElementAnchors(stableAnchors);
      keepRenderedElementsInsideSections();
      renderResizeHandle();
    }
    renderSelectionStyle();
    markChanged();
  }
  function renderSectionTypes() {
    let types = [
      ["hero", "▣", "히어로(상단)"],
      ["section", "▦", "섹션(중단)"],
      ["footer", "━", "푸터(하단)"],
    ];
    $("#sectionTypeGrid").html(
      types
        .map(function (t) {
          return (
            '<button class="section-type-card" data-type="' +
            t[0] +
            '"><span class="section-type-icon">' +
            t[1] +
            '</span><span class="section-type-name">' +
            t[2] +
            "</span></button>"
          );
        })
        .join(""),
    );
  }

  function bindEvents() {
    $(window).on("resize", fitTemplatePreviews);
    $(document).on("click", ".template-card,.workspace-tab", function (e) {
      if (
        $(e.target).closest(
          ".workspace-tab-tool,[contenteditable=true]",
        ).length
      )
        return;
      selectTemplate($(this).data("template"));
    });
    $(document).on("keydown", ".workspace-tab", function (e) {
      if (
        $(e.target).closest(".workspace-tab-tool").length ||
        $(e.target).is("[contenteditable=true]") ||
        (e.key !== "Enter" && e.key !== " ")
      )
        return;
      e.preventDefault();
      selectTemplate($(this).data("template"));
    });
    $(document).on("click", "#addWorkspaceBtn", function (e) {
      e.preventDefault();
      addWorkspace();
    });
    $(document).on("click", "#templatePagePrev,#templatePageNext", function (e) {
      e.preventDefault();
      workspaceCarouselPage += this.id === "templatePageNext" ? 1 : -1;
      renderTemplates();
    });
    $(document).on("click", "[data-duplicate-workspace]", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      duplicateWorkspace(String($(this).attr("data-duplicate-workspace") || ""));
    });
    $(document).on("keydown", "[data-duplicate-workspace]", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      duplicateWorkspace(String($(this).attr("data-duplicate-workspace") || ""));
    });
    $(document).on("click", "[data-delete-workspace]", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      deleteWorkspace(String($(this).attr("data-delete-workspace") || ""));
    });
    $(document).on("keydown", "[data-delete-workspace]", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      deleteWorkspace(String($(this).attr("data-delete-workspace") || ""));
    });
    $(document).on("click", "[data-edit-workspace]", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      beginWorkspaceRename(String($(this).attr("data-edit-workspace") || ""));
    });
    $(document).on("keydown", "[data-edit-workspace]", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      beginWorkspaceRename(String($(this).attr("data-edit-workspace") || ""));
    });
    $(document).on("dblclick", ".workspace-tab-name", function (e) {
      e.preventDefault();
      e.stopPropagation();
      beginWorkspaceRename(String($(this).attr("data-workspace-key") || ""));
    });
    $(document).on("keydown", ".workspace-tab-name[contenteditable=true]", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        this.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        $(this).attr("data-rename-cancelled", "true");
        this.blur();
      }
    });
    $(document).on("blur", ".workspace-tab-name[contenteditable=true]", function () {
      finishWorkspaceRename(this);
    });
    $(document).on("click", ".section-item", function (e) {
      if ($(e.target).closest(".section-tools").length) return;
      selectSection($(this).data("id"));
    });
    $(document).on("click", ".section-tools button", function (e) {
      e.stopPropagation();
      let id = $(this).closest(".section-item").data("id"),
        action = $(this).data("action"),
        arr = currentTemplate().sections,
        idx = arr.findIndex(function (s) {
          return s.id === id;
        });
      if (idx < 0) return;
      if (action === "delete") {
        deleteSectionById(id);
        return;
      }
      mutateWithHistory(function () {
        if (action === "toggle")
          arr[idx].visible = arr[idx].visible === false ? true : false;
        else if (action === "duplicate") {
          let c = clone(arr[idx]);
          c.id = uid("copy");
          c.name += " 복사본";
          arr.splice(idx + 1, 0, c);
          state.selectedSectionId = c.id;
          state.selectedElementKey = null;
          state.selectedElements = [];
        }
      });
    });

    let draggedId = null;
    $(document).on("dragstart", ".section-item", function (e) {
      pushHistory();
      draggedId = $(this).data("id");
      $(this).addClass("dragging");
      e.originalEvent.dataTransfer.effectAllowed = "move";
    });
    $(document).on("dragend", ".section-item", function () {
      $(this).removeClass("dragging");
      draggedId = null;
    });
    $(document).on("dragover", ".section-item", function (e) {
      e.preventDefault();
      if (!draggedId) return;
      let target = $(this).data("id");
      if (target === draggedId) return;
      let arr = currentTemplate().sections,
        from = arr.findIndex(function (s) {
          return s.id === draggedId;
        }),
        to = arr.findIndex(function (s) {
          return s.id === target;
        });
      if (from < 0 || to < 0) return;
      let moved = arr.splice(from, 1)[0];
      arr.splice(to, 0, moved);
      renderSectionList();
      renderPage();
      markChanged();
    });
    $(document).on("drop", ".section-item", function (e) {
      e.preventDefault();
      markChanged();
    });

    $(document).on(
      "input change compositionend",
      "#textFieldsList .dynamic-text-input",
      function () {
        updateSectionText(
          String($(this).attr("data-text-key") || ""),
          this.value,
        );
        $(this)
          .closest(".element-field-card")
          .find("[data-translate-text-key]")
          .prop("disabled", !String(this.value || "").trim());
      },
    );
    $("#editorFields").on("click", "[data-duplicate-editor-key]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      duplicateEditorElement(String($(this).data("duplicate-editor-key")));
    });
    $("#addTextElementBtn").on("click", function () {
      if (!currentSection()) return;
      $("#textTypeModal").prop("hidden", false);
    });
    $(document).on("click", '[data-text-type="normal"],[data-text-type="srno"],[data-text-type="scan-count"],[data-text-type="scan-time"]', function () {
      let s = currentSection();
      if (!s) return;
      let textType = String($(this).data("text-type") || "normal"),
        initialValue =
          textType === "srno"
            ? "<%=no%>"
            : textType === "scan-count"
              ? "<%=scancount %>"
              : textType === "scan-time"
                ? formatScanDate(new Date())
              : "새 텍스트";
      mutateWithHistory(function () {
        s.extraTexts = s.extraTexts || [];
        let key = "extraText" + s.extraTexts.length;
        s.extraTexts.push(initialValue);
        s.extraTextTypes = s.extraTextTypes || [];
        s.extraTextTypes.push(textType);
        s.elementStyles = s.elementStyles || {};
        s.elementStyles[key] = { color: DEFAULT_TEXT_COLOR };
      });
      $("#textTypeModal").prop("hidden", true);
    });
    $("#textFieldsList").on("click", "[data-remove-text-key]", function () {
      let s = currentSection(),
        key = String($(this).data("remove-text-key"));
      if (!s || !key) return;
      deleteSelectedElements([{ sectionId: s.id, section: s, key: key }]);
    });
    $("#buttonFieldsList").on("input", ".dynamic-button-input", function () {
      updateSectionButton(
        Number($(this).data("button-index")),
        $(this).data("button-field"),
        this.value,
      );
      if ($(this).data("button-field") === "text")
        $(this)
          .closest(".element-field-card")
          .find("[data-translate-button-index]")
          .prop("disabled", !String(this.value || "").trim());
    });
    $("#buttonFieldsList").on("change", ".dynamic-button-order", function () {
      updateSectionButton(
        Number($(this).data("button-index")),
        "contentOrder",
        this.value,
      );
    });
    $("#addButtonElementBtn").on("click", function () {
      let s = currentSection();
      if (!s) return;
      $("#buttonTypeModal").prop("hidden", false);
    });
    $(document).on("click", "[data-button-type]", function () {
      let s = currentSection();
      if (!s) return;
      let buttonType = String($(this).data("button-type") || "normal"),
        buttonText = buttonType === "product" ? "상품 버튼" : "새 버튼",
        buttonImage =
          buttonType === "product" ? DEFAULT_PRODUCT_BUTTON_IMAGE : "";
      mutateWithHistory(function () {
        if (s.primaryButtonRemoved) {
          s.primaryButtonRemoved = false;
          s.buttonText = buttonText;
          s.buttonImage = buttonImage;
          s.buttonBackgroundImage = "";
          s.buttonContentOrder = "image-text";
          s.buttonContentGap = 0;
          s.buttonType = buttonType;
          s.buttonLink = "#";
        } else {
          s.extraButtons = s.extraButtons || [];
          s.extraButtons.push({
            text: buttonText,
            image: buttonImage,
            backgroundImage: "",
            contentOrder: "image-text",
            contentGap: 0,
            buttonType: buttonType,
            link: "#",
          });
        }
      });
      $("#buttonTypeModal").prop("hidden", true);
    });
    $(document).on("click", "[data-add-shape-type]", function () {
      let s = currentSection(),
        type = normalizedShapeType($(this).data("add-shape-type"));
      if (!s) return;
      mutateWithHistory(function () {
        s.extraShapes = s.extraShapes || [];
        let key = "shape" + s.extraShapes.length;
        s.extraShapes.push({ type: type });
        s.elementStyles = s.elementStyles || {};
        s.elementStyles[key] = shapeDefaultStyle(type);
        state.selectedSectionId = s.id;
        state.selectedElementKey = key;
        state.selectedElements = [{ sectionId: s.id, key: key }];
      });
    });
    $("#shapeFieldsList").on("change", ".dynamic-shape-type", function () {
      let s = currentSection(),
        index = Number($(this).data("shape-index")),
        type = normalizedShapeType(this.value);
      if (!s || !s.extraShapes || !s.extraShapes[index]) return;
      mutateWithHistory(function () {
        s.extraShapes[index].type = type;
        let key = "shape" + index,
          defaults = shapeDefaultStyle(type);
        s.elementStyles = s.elementStyles || {};
        s.elementStyles[key] = s.elementStyles[key] || {};
        s.elementStyles[key].width = defaults.width;
        s.elementStyles[key].height = defaults.height;
        if (!s.elementStyles[key].backgroundColor)
          s.elementStyles[key].backgroundColor = defaults.backgroundColor;
        delete s.elementStyles[key].borderRadius;
      });
    });
    $("#shapeFieldsList").on("click", "[data-remove-shape]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      let s = currentSection(),
        index = Number($(this).data("remove-shape"));
      if (!s || !Number.isInteger(index)) return;
      deleteSelectedElements([
        { sectionId: s.id, section: s, key: "shape" + index },
      ]);
    });
    $("#buttonFieldsList").on("click", "[data-remove-button]", function () {
      let s = currentSection(),
        index = Number($(this).data("remove-button"));
      if (!s || index < 0) return;
      deleteSelectedElements([
        {
          sectionId: s.id,
          section: s,
          key: index === 0 ? "button" : "button" + index,
        },
      ]);
    });
    $("#buttonFieldsList").on("change", ".dynamic-button-image", function () {
      let file = this.files && this.files[0],
        index = Number($(this).data("button-index"));
      if (!file) return;
      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        toast("이미지는 " + MAX_IMAGE_UPLOAD_MB + "MB 이하로 선택하세요.");
        this.value = "";
        return;
      }
      let input = this,
        reader = new FileReader();
      reader.onload = function (e) {
        pushHistory();
        updateSectionButton(index, "image", e.target.result);
        renderEditor();
        input.value = "";
      };
      reader.readAsDataURL(file);
    });
    $("#buttonFieldsList").on(
      "click",
      "[data-remove-button-image]",
      function () {
        let index = Number($(this).data("remove-button-image")),
          button = sectionButtons(currentSection()).find(function (item) {
            return item.index === index;
          });
        if (!button || !button.image) return;
        pushHistory();
        updateSectionButton(index, "image", "");
        renderEditor();
      },
    );
    $("#buttonFieldsList").on(
      "change",
      ".dynamic-button-background-image",
      function () {
        let file = this.files && this.files[0],
          index = Number($(this).data("button-index"));
        if (!file) return;
        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          toast("이미지는 " + MAX_IMAGE_UPLOAD_MB + "MB 이하로 선택하세요.");
          this.value = "";
          return;
        }
        let input = this,
          reader = new FileReader();
        reader.onload = function (e) {
          pushHistory();
          updateSectionButton(index, "backgroundImage", e.target.result);
          renderEditor();
          input.value = "";
        };
        reader.readAsDataURL(file);
      },
    );
    $("#buttonFieldsList").on(
      "click",
      "[data-remove-button-background]",
      function () {
        let index = Number($(this).data("remove-button-background")),
          button = sectionButtons(currentSection()).find(function (item) {
            return item.index === index;
          });
        if (!button || !button.backgroundImage) return;
        pushHistory();
        updateSectionButton(index, "backgroundImage", "");
        renderEditor();
      },
    );
    $("#imageUpload").on("change", function () {
      let file = this.files && this.files[0];
      if (!file) return;
      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        toast("이미지는 " + MAX_IMAGE_UPLOAD_MB + "MB 이하로 선택하세요.");
        return;
      }
      let reader = new FileReader();
      reader.onload = function (e) {
        pushHistory();
        let s = currentSection();
        s.image = e.target.result;
        renderPage();
        renderEditor();
        markChanged();
      };
      reader.readAsDataURL(file);
      this.value = "";
    });
    $("#removeImageBtn").on("click", function () {
      let s = currentSection();
      if (!s) return;
      deleteSelectedElements([{ sectionId: s.id, section: s, key: "image" }]);
    });
    $("#imageBrightness").on("input", function () {
      let s = currentSection();
      if (!s || !s.image) return;
      let value = Math.max(30, Math.min(170, Number(this.value) || 100));
      s.imageBrightness = value;
      $("#imageBrightnessOutput").text(value + "%");
      $("#resetImageBrightnessBtn").prop("disabled", value === 100);
      renderPage();
      markChanged();
    });
    $("#resetImageBrightnessBtn").on("click", function () {
      let s = currentSection();
      if (!s || !s.image) return;
      mutateWithHistory(function () {
        s.imageBrightness = 100;
      });
    });
    $("#imageHeight")
      .on("input", function () {
        let s = currentSection();
        if (!s || !s.image || s.imageFitSectionHeight || this.value === "")
          return;
        let value = Number(this.value);
        if (!Number.isFinite(value)) return;
        s.imageHeight = value;
        renderPage();
        markChanged();
      })
      .on("change", function () {
        let s = currentSection();
        if (!s) return;
        if (this.value === "") {
          delete s.imageHeight;
          renderPage();
          markChanged();
          return;
        }
        let value = Math.max(20, Math.min(3000, Number(this.value) || 20));
        this.value = value;
        s.imageHeight = value;
        renderPage();
        markChanged();
      });
    $("#imageFitSectionHeight").on("change", function () {
      let s = currentSection();
      if (!s || s.type === "hero" || !s.image) return;
      let checked = this.checked,
        currentHeight = 0;
      $("#deviceScreen .lp-section").each(function () {
        if ($(this).data("section-id") === s.id)
          currentHeight = this.offsetHeight;
      });
      mutateWithHistory(function () {
        s.imageFitSectionHeight = checked;
        if (checked) {
          s.customStyle = s.customStyle || {};
          if (s.customStyle.height === undefined)
            s.customStyle.height = Math.max(40, currentHeight || 40);
        }
      });
    });
    $("#addImageElementBtn").on("click", function () {
      let s = currentSection();
      if (!s) return;
      mutateWithHistory(function () {
        s.extraImages = s.extraImages || [];
        s.extraImages.push("");
      });
    });
    $("#extraImageFieldsList").on(
      "change",
      ".dynamic-extra-image",
      function () {
        let file = this.files && this.files[0],
          index = Number($(this).data("extra-image-index"));
        if (!file) return;
        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          toast("이미지는 " + MAX_IMAGE_UPLOAD_MB + "MB 이하로 선택하세요.");
          this.value = "";
          return;
        }
        let input = this,
          reader = new FileReader();
        reader.onload = function (e) {
          pushHistory();
          let s = currentSection();
          s.extraImages = s.extraImages || [];
          s.extraImages[index] = e.target.result;
          renderPage();
          renderEditor();
          markChanged();
          input.value = "";
        };
        reader.readAsDataURL(file);
      },
    );
    $("#extraImageFieldsList").on(
      "click",
      "[data-remove-extra-image]",
      function () {
        let s = currentSection(),
          index = Number($(this).data("remove-extra-image"));
        if (!s || index < 0) return;
        deleteSelectedElements([
          {
            sectionId: s.id,
            section: s,
            key: "extraImage" + index,
          },
        ]);
      },
    );
    $("#duplicateSectionBtn").on("click", function () {
      let arr = currentTemplate().sections,
        s = currentSection();
      if (!s) return;
      let idx = arr.indexOf(s);
      mutateWithHistory(function () {
        let c = clone(s);
        c.id = uid("copy");
        c.name += " 복사본";
        arr.splice(idx + 1, 0, c);
        state.selectedSectionId = c.id;
        state.selectedElementKey = null;
        state.selectedElements = [];
      });
    });
    $("#deleteSectionBtn").on("click", function () {
      let s = currentSection();
      if (!s) return;
      deleteSectionById(s.id);
    });

    $(".right-tab").on("click", function () {
      renderStyle();
      $(".right-tab").removeClass("active");
      $(this).addClass("active");
      $(".right-content").removeClass("active");
      $("#" + $(this).data("tab") + "Panel").addClass("active");
    });
    bindNumericStyleInput("#targetFontSize", "fontSize", 8, 160);
    bindNumericStyleInput("#targetTextWidth", "width", 10, 1024);
    bindNumericStyleInput("#targetTextHeight", "height", 10, 3000);
    bindNumericStyleInput("#targetTextRadius", "borderRadius", 0, 500);
    $("#targetFontFamily").on("change", function () {
      applySelectionStyle("fontFamily", this.value);
    });
    $("#targetFontWeight").on("change", function () {
      applySelectionStyle("fontWeight", Number(this.value));
    });
    $("#targetFontColor").on("input", function () {
      applySelectionStyle("color", this.value);
    });
    $("#targetBackgroundColor").on("input", function () {
      applySelectionStyle("backgroundColor", this.value);
    });
    $("#targetBorderColor").on("input", function () {
      applySelectionStyle("borderColor", this.value);
    });
    $(
      "#targetFontColor,#targetBackgroundColor,#targetBorderColor,#targetGradientStart,#targetGradientEnd,#targetShadowColor",
    ).on("input", function () {
      $('.hex-color-input[data-color-picker="' + this.id + '"]')
        .val(String(this.value || "").toLowerCase())
        .removeClass("invalid");
    });
    $(".hex-color-input[data-color-picker]")
      .on("input", function () {
        let normalized = normalizeHexColor(this.value),
          $input = $(this);
        $input.toggleClass("invalid", !!this.value && !normalized);
        if (!normalized) return;
        let picker = document.getElementById($input.data("color-picker"));
        if (picker) picker.value = normalized;
        applySelectionStyle($input.data("color-field"), normalized);
      })
      .on("change blur", function () {
        let normalized = normalizeHexColor(this.value),
          picker = document.getElementById($(this).data("color-picker"));
        if (normalized) $(this).val(normalized).removeClass("invalid");
        else
          $(this)
            .val(picker ? picker.value : "")
            .removeClass("invalid");
      })
      .on("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          this.blur();
        }
      });
    $("[data-clear-style-color]").on("click", function () {
      let field = $(this).data("clear-style-color"),
        value = null;
      if (field === "backgroundColor") {
        let target = selectionStyleTargets();
        let boxElementsOnly =
          target.kind === "element" &&
          target.items.length &&
          target.items.every(function (item) {
            return /^button/.test(item.key) || /^shape/.test(item.key);
          });
        if (boxElementsOnly) value = "transparent";
      }
      applySelectionStyle(field, value);
    });
    bindNumericStyleInput("#targetBorderWidth", "borderWidth", 0, 20);
    bindSectionHeightInput();
    bindNumericStyleInput("#targetButtonWidth", "width", 10, 1024);
    bindNumericStyleInput("#targetButtonHeight", "height", 2, 1000);
    bindNumericStyleInput("#targetButtonRadius", "borderRadius", 0, 500);
    $("#targetBrightness").on("input", function () {
      let value = Math.max(30, Math.min(170, Number(this.value) || 100));
      $("#targetBrightnessOutput").text(value + "%");
      applySelectionStyle("brightness", value);
    });
    $("#targetGradientEnabled").on("change", function () {
      applySelectionStyle("gradientEnabled", this.checked);
    });
    $("#targetGradientStart").on("input", function () {
      applySelectionStyle("gradientStart", this.value);
    });
    $("#targetGradientEnd").on("input", function () {
      applySelectionStyle("gradientEnd", this.value);
    });
    bindNumericStyleInput("#targetGradientAngle", "gradientAngle", 0, 360);
    bindNumericStyleInput("#targetRotation", "rotation", -360, 360);
    bindNumericStyleInput("#targetScale", "scale", 10, 500);
    $("#targetFlipX").on("change", function () {
      applySelectionStyle("flipX", this.checked);
    });
    $("#targetFlipY").on("change", function () {
      applySelectionStyle("flipY", this.checked);
    });
    $("#targetInvertColors").on("change", function () {
      applySelectionStyle("invertColors", this.checked);
    });
    $("#targetShadowEnabled").on("change", function () {
      applySelectionStyle("shadowEnabled", this.checked);
    });
    $("#targetShadowColor").on("input", function () {
      applySelectionStyle("shadowColor", this.value);
    });
    bindNumericStyleInput("#targetShadowX", "shadowX", -100, 100);
    bindNumericStyleInput("#targetShadowY", "shadowY", -100, 100);
    bindNumericStyleInput("#targetShadowBlur", "shadowBlur", 0, 200);
    $("#targetReflectionEnabled").on("change", function () {
      applySelectionStyle("reflectionEnabled", this.checked);
    });
    bindNumericStyleInput("#targetReflectionGap", "reflectionGap", 0, 100);
    $("#resetSelectionStyleBtn").on("click", function () {
      let target = selectionStyleTargets();
      if (!target.kind) return;
      mutateWithHistory(function () {
        target.items.forEach(function (item) {
          if (target.kind === "element") {
            if (item.section.elementStyles)
              delete item.section.elementStyles[item.key];
          } else delete item.section.customStyle;
        });
      });
    });
    $("#deviceWidthInput").on("change", function () {
      changeDeviceWidth(this.value);
    });
    $("#deviceWidthDownBtn").on("click", function () {
      changeDeviceWidth(state.deviceWidth - 20);
    });
    $("#deviceWidthUpBtn").on("click", function () {
      changeDeviceWidth(state.deviceWidth + 20);
    });
    $("#zoomOutBtn").on("click", function () {
      changeZoom(state.zoom - 10);
    });
    $("#zoomInBtn").on("click", function () {
      changeZoom(state.zoom + 10);
    });
    $("#zoomValue").on("click keydown", function (e) {
      if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      changeZoom(100);
    });
    $(".canvas-stage").on("wheel.canvasZoom", function (e) {
      let original = e.originalEvent;
      if (!original || (!original.ctrlKey && !original.metaKey)) return;
      e.preventDefault();
      changeZoom(
        state.zoom + (original.deltaY < 0 ? 10 : -10),
        original,
      );
    });

    let canvasDraggedId = null,
      canvasDragScroll = 0;
    $("#deviceScreen").on(
      "dragstart",
      "[data-section-drag-handle]",
      function (e) {
        e.stopPropagation();
        canvasDraggedId = $(this).closest(".lp-section").data("section-id");
        canvasDragScroll = $("#deviceScreen").scrollTop();
        pushHistory();
        $(this).closest(".lp-section").addClass("canvas-section-dragging");
        e.originalEvent.dataTransfer.effectAllowed = "move";
        try {
          e.originalEvent.dataTransfer.setData("text/plain", canvasDraggedId);
        } catch (ignore) {}
      },
    );
    $("#deviceScreen").on("dragover", ".lp-section", function (e) {
      if (!canvasDraggedId) return;
      e.preventDefault();
      e.stopPropagation();
      let target = $(this).data("section-id");
      if (target === canvasDraggedId) return;
      let arr = currentTemplate().sections;
      let from = arr.findIndex(function (s) {
          return s.id === canvasDraggedId;
        }),
        to = arr.findIndex(function (s) {
          return s.id === target;
        });
      if (from < 0 || to < 0) return;
      let moved = arr.splice(from, 1)[0];
      arr.splice(to, 0, moved);
      let $drag = $(
        '#deviceScreen .lp-section[data-section-id="' + canvasDraggedId + '"]',
      );
      if (from < to) $(this).after($drag);
      else $(this).before($drag);
      $("#deviceScreen .lp-section").removeClass("canvas-drop-target");
      $(this).addClass("canvas-drop-target");
      renderSectionList();
    });
    $("#deviceScreen").on("drop", ".lp-section", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    $("#deviceScreen").on("dragend", "[data-section-drag-handle]", function () {
      $("#deviceScreen .lp-section").removeClass(
        "canvas-section-dragging canvas-drop-target",
      );
      canvasDraggedId = null;
      renderPage();
      $("#deviceScreen").scrollTop(canvasDragScroll);
      markChanged();
    });

    let directDrag = null;
    $("#deviceScreen").on("pointerdown", ".canvas-movable", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      let $el = $(this),
        $section = $el.closest(".lp-section"),
        sectionId = $section.data("section-id"),
        key = $el.data("move-key");
      let s = currentTemplate().sections.find(function (item) {
        return item.id === sectionId;
      });
      if (!s) return;
      let additive = e.ctrlKey || e.metaKey,
        index = selectionIndex(sectionId, key),
        pendingToggle = additive && index >= 0;
      if (additive && index < 0)
        state.selectedElements.push({ sectionId: sectionId, key: key });
      if (!additive) {
        if (index < 0)
          state.selectedElements = [{ sectionId: sectionId, key: key }];
        else {
          state.selectedElements.splice(index, 1);
          state.selectedElements.push({ sectionId: sectionId, key: key });
        }
      }
      state.selectedSectionId = sectionId;
      state.selectedElementKey = key;
      syncElementSelectionClasses();
      renderSectionList();
      renderEditor();
      renderStyle();
      renderResizeHandle();
      scrollRightEditorToSelection(key);
      let frame = $("#deviceFrame")[0],
        rect = frame.getBoundingClientRect(),
        scale = rect.width / frame.offsetWidth;
      let pos = getPosition(s, key);
      let items = selectedEntries()
        .filter(function (item) {
          return !!item.node;
        })
        .map(function (item) {
          let p = getPosition(item.section, item.key),
            bounds = renderedContainment(item.node);
          return {
            node: item.node,
            section: item.section,
            key: item.key,
            originX: p.x,
            originY: p.y,
            minMoveX: bounds ? bounds.minX : 0,
            maxMoveX: bounds ? bounds.maxX : 0,
            minMoveY: bounds ? bounds.minY : 0,
            maxMoveY: bounds ? bounds.maxY : 0,
          };
        });
      let minMoveX = items.reduce(function (value, item) {
          return Math.max(value, item.minMoveX);
        }, -Infinity),
        maxMoveX = items.reduce(function (value, item) {
          return Math.min(value, item.maxMoveX);
        }, Infinity),
        minMoveY = items.reduce(function (value, item) {
          return Math.max(value, item.minMoveY);
        }, -Infinity),
        maxMoveY = items.reduce(function (value, item) {
          return Math.min(value, item.maxMoveY);
        }, Infinity);
      if (!items.length || minMoveX > maxMoveX) minMoveX = maxMoveX = 0;
      if (!items.length || minMoveY > maxMoveY) minMoveY = maxMoveY = 0;
      directDrag = {
        el: this,
        section: s,
        sectionId: sectionId,
        key: key,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
        items: items,
        minMoveX: minMoveX,
        maxMoveX: maxMoveX,
        minMoveY: minMoveY,
        maxMoveY: maxMoveY,
        scale: scale || 1,
        moved: false,
        pointerId: e.pointerId,
        axisLock: null,
        pendingToggle: pendingToggle,
        additive: additive,
      };
      try {
        this.setPointerCapture(e.pointerId);
      } catch (ignore) {}
      $("body").addClass("direct-moving");
    });
    $(document).on("pointermove.directMove", function (e) {
      if (!directDrag) return;
      let dx = (e.clientX - directDrag.startX) / directDrag.scale,
        dy = (e.clientY - directDrag.startY) / directDrag.scale;
      if (!directDrag.moved && Math.abs(dx) + Math.abs(dy) > 2) {
        pushHistory();
        directDrag.moved = true;
      }
      if (!directDrag.moved) return;
      if (e.shiftKey) {
        if (!directDrag.axisLock)
          directDrag.axisLock = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        if (directDrag.axisLock === "x") dy = 0;
        else dx = 0;
      } else directDrag.axisLock = null;
      let x = directDrag.originX + dx,
        y = directDrag.originY + dy;
      if (e.ctrlKey || e.metaKey) {
        if (directDrag.axisLock !== "y") x = Math.round(x / 10) * 10;
        if (directDrag.axisLock !== "x") y = Math.round(y / 10) * 10;
      }
      let moveX = x - directDrag.originX,
        moveY = y - directDrag.originY;
      moveX = Math.max(
        directDrag.minMoveX,
        Math.min(directDrag.maxMoveX, moveX),
      );
      moveY = Math.max(
        directDrag.minMoveY,
        Math.min(directDrag.maxMoveY, moveY),
      );
      x = directDrag.originX + moveX;
      y = directDrag.originY + moveY;
      directDrag.items.forEach(function (item) {
        let itemX = item.originX + moveX,
          itemY = item.originY + moveY;
        setPosition(item.section, item.key, itemX, itemY);
        $(item.node).css(
          "transform",
          elementTransform(item.section, item.key, itemX, itemY),
        );
      });
      let $resizeHandles = $("#deviceScreen .canvas-resize-handle");
      if ($resizeHandles.length)
        positionResizeHandles(
          $resizeHandles,
          directDrag.el,
          $(directDrag.el).closest(".lp-section")[0],
        );
      $("#positionX").val(Math.round(x));
      $("#positionY").val(Math.round(y));
    });
    $(document).on(
      "pointerup.directMove pointercancel.directMove",
      function () {
        if (!directDrag) return;
        if (directDrag.moved) markChanged();
        else if (!directDrag.additive && state.selectedElements.length > 1) {
          state.selectedElements = [
            { sectionId: directDrag.sectionId, key: directDrag.key },
          ];
          state.selectedSectionId = directDrag.sectionId;
          state.selectedElementKey = directDrag.key;
          syncElementSelectionClasses();
          renderSectionList();
          renderEditor();
          renderStyle();
        } else if (directDrag.pendingToggle) {
          let index = selectionIndex(directDrag.sectionId, directDrag.key);
          if (index >= 0) state.selectedElements.splice(index, 1);
          syncPrimarySelection(directDrag.sectionId);
          syncElementSelectionClasses();
          renderSectionList();
          renderEditor();
          renderStyle();
        }
        try {
          directDrag.el.releasePointerCapture(directDrag.pointerId);
        } catch (ignore) {}
        directDrag = null;
        $("body").removeClass("direct-moving");
        renderPositionEditor();
        renderResizeHandle();
      },
    );
    let marqueeDrag = null,
      suppressMarqueeClick = false;
    $(".canvas-stage").on("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.pointerType === "touch") return;
      let $target = $(e.target),
        $section = $target.closest(".lp-section");
      if (
        $target.closest(
          ".canvas-movable,.canvas-resize-handle,.canvas-section-controls,[data-section-drag-handle]",
        ).length
      )
        return;
      e.preventDefault();
      let additive = e.ctrlKey || e.metaKey,
        $box = $('<div class="canvas-selection-box" hidden></div>').appendTo(
          document.body,
        );
      marqueeDrag = {
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        captureNode: this,
        sectionId: $section.length ? $section.data("section-id") : null,
        additive: additive,
        initialSelection: additive ? clone(state.selectedElements) : [],
        box: $box,
        moved: false,
      };
      $("#deviceScreen .canvas-resize-handle").remove();
      try {
        this.setPointerCapture(e.pointerId);
      } catch (ignore) {}
    });
    $(document).on("pointermove.marqueeSelect", function (e) {
      if (!marqueeDrag) return;
      let dx = e.clientX - marqueeDrag.startX,
        dy = e.clientY - marqueeDrag.startY;
      if (!marqueeDrag.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      e.preventDefault();
      marqueeDrag.moved = true;
      $("body").addClass("marquee-selecting");
      let left = Math.min(marqueeDrag.startX, e.clientX),
        top = Math.min(marqueeDrag.startY, e.clientY),
        right = Math.max(marqueeDrag.startX, e.clientX),
        bottom = Math.max(marqueeDrag.startY, e.clientY);
      marqueeDrag.box
        .prop("hidden", false)
        .css({
          left: left + "px",
          top: top + "px",
          width: right - left + "px",
          height: bottom - top + "px",
        });
      let selection = marqueeDrag.initialSelection.slice();
      $("#deviceScreen .canvas-movable:visible").each(function () {
        let rect = this.getBoundingClientRect();
        if (
          rect.right < left ||
          rect.left > right ||
          rect.bottom < top ||
          rect.top > bottom
        )
          return;
        let $element = $(this),
          item = {
            sectionId: $element.closest(".lp-section").data("section-id"),
            key: $element.data("move-key"),
          };
        let exists = selection.some(function (selected) {
          return (
            String(selected.sectionId) === String(item.sectionId) &&
            String(selected.key) === String(item.key)
          );
        });
        if (!exists) selection.push(item);
      });
      state.selectedElements = selection;
      syncPrimarySelection(marqueeDrag.sectionId);
      syncElementSelectionClasses();
    });
    $(document).on(
      "pointerup.marqueeSelect pointercancel.marqueeSelect",
      function () {
        if (!marqueeDrag) return;
        let drag = marqueeDrag;
        if (drag.moved) {
          suppressMarqueeClick = true;
          setTimeout(function () {
            suppressMarqueeClick = false;
          }, 80);
        }
        if (!drag.moved && !drag.additive) {
          state.selectedElements = [];
          state.selectedElementKey = null;
          state.selectedSectionId = drag.sectionId;
        } else {
          syncPrimarySelection(drag.sectionId);
          if (!state.selectedElements.length && !drag.sectionId) {
            state.selectedSectionId = null;
            state.selectedElementKey = null;
          }
        }
        drag.box.remove();
        try {
          drag.captureNode.releasePointerCapture(drag.pointerId);
        } catch (ignore) {}
        marqueeDrag = null;
        $("body").removeClass("marquee-selecting");
        renderSectionList();
        renderPage();
        renderEditor();
        renderStyle();
      },
    );
    let resizeDrag = null;
    $("#deviceScreen").on("pointerdown", ".canvas-resize-handle", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      let $handle = $(this),
        sectionId = $handle.attr("data-section-id"),
        key = $handle.attr("data-resize-key"),
        direction = $handle.attr("data-resize-direction") || "se";
      let section = currentTemplate().sections.find(function (item) {
        return String(item.id) === String(sectionId);
      });
      let entry = selectedEntries().find(function (item) {
        return String(item.sectionId) === String(sectionId) && item.key === key;
      });
      if (!section || !entry || !entry.node) return;
      let frame = $("#deviceFrame")[0],
        frameRect = frame.getBoundingClientRect(),
        scale = frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
      scale = scale || 1;
      let effectStyle =
          (section.elementStyles && section.elementStyles[key]) || {},
        effectScale = Math.max(0.1, Number(effectStyle.scale) || 100) / 100;
      let rect = entry.node.getBoundingClientRect(),
        startWidth = rect.width / (scale * effectScale),
        startHeight = rect.height / (scale * effectScale);
      let startPosition = getPosition(section, key);
      pushHistory();
      if (key === "image") section.imageFitSectionHeight = false;
      resizeDrag = {
        handle: this,
        node: entry.node,
        section: section,
        key: key,
        direction: direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: startWidth,
        startHeight: startHeight,
        startRect: rect,
        startPosition: startPosition,
        stableAnchors: captureStableElementAnchors(
          [sectionId],
          [{ sectionId: sectionId, key: key }],
        ),
        ratio: startWidth / startHeight,
        scale: scale,
        pointerId: e.pointerId,
      };
      try {
        this.setPointerCapture(e.pointerId);
      } catch (ignore) {}
      document.body.style.setProperty(
        "--resize-cursor",
        /^(nw|se)$/.test(direction)
          ? "nwse-resize"
          : /^(ne|sw)$/.test(direction)
            ? "nesw-resize"
            : /^(n|s)$/.test(direction)
              ? "ns-resize"
              : "ew-resize",
      );
      $("body").addClass("direct-resizing");
    });
    $(document).on("pointermove.canvasResize", function (e) {
      if (!resizeDrag) return;
      let isImage =
          resizeDrag.key === "image" || /^extraImage/.test(resizeDrag.key),
        isShape = /^shape/.test(resizeDrag.key),
        minWidth = isImage ? 20 : 10,
        minHeight = isImage ? 20 : isShape ? 2 : 10;
      let dx = (e.clientX - resizeDrag.startX) / resizeDrag.scale,
        dy = (e.clientY - resizeDrag.startY) / resizeDrag.scale;
      let horizontal = /[we]/.test(resizeDrag.direction),
        vertical = /[ns]/.test(resizeDrag.direction);
      let width =
        resizeDrag.startWidth +
        (resizeDrag.direction.indexOf("w") >= 0
          ? -dx
          : resizeDrag.direction.indexOf("e") >= 0
            ? dx
            : 0);
      let height =
        resizeDrag.startHeight +
        (resizeDrag.direction.indexOf("n") >= 0
          ? -dy
          : resizeDrag.direction.indexOf("s") >= 0
            ? dy
            : 0);
      if (e.shiftKey && resizeDrag.ratio) {
        if (horizontal && !vertical) height = width / resizeDrag.ratio;
        else if (vertical && !horizontal) width = height * resizeDrag.ratio;
        else if (
          Math.abs(width - resizeDrag.startWidth) >=
          Math.abs(height - resizeDrag.startHeight)
        )
          height = width / resizeDrag.ratio;
        else width = height * resizeDrag.ratio;
      }
      let changeWidth = horizontal || (e.shiftKey && !!resizeDrag.ratio),
        changeHeight = vertical || (e.shiftKey && !!resizeDrag.ratio);
      width = Math.round(Math.max(minWidth, Math.min(1024, width)));
      height = Math.round(Math.max(minHeight, Math.min(3000, height)));
      if (resizeDrag.key === "image") {
        let imageScale = responsiveScale(state.deviceWidth) || 1,
          storedImageWidth = Math.round(width / imageScale),
          storedImageHeight = Math.round(height / imageScale);
        if (changeWidth) resizeDrag.section.imageWidth = storedImageWidth;
        if (changeHeight) resizeDrag.section.imageHeight = storedImageHeight;
        if (changeHeight) $("#imageHeight").val(storedImageHeight);
        $("#imageFitSectionHeight").prop("checked", false);
        $("#imageHeight").prop("disabled", false);
      } else {
        resizeDrag.section.elementStyles =
          resizeDrag.section.elementStyles || {};
        let resizeStyle =
          resizeDrag.section.elementStyles[resizeDrag.key] ||
          (resizeDrag.section.elementStyles[resizeDrag.key] = {});
        let elementScale = responsiveScale(state.deviceWidth) || 1;
        let storedWidth = Math.round(width / elementScale);
        let storedHeight = Math.round(height / elementScale);
        if (changeWidth) resizeStyle.width = storedWidth;
        if (changeHeight) resizeStyle.height = storedHeight;
        if (/^button/.test(resizeDrag.key) || /^shape/.test(resizeDrag.key)) {
          if (changeWidth) $("#targetButtonWidth").val(storedWidth);
          if (changeHeight) $("#targetButtonHeight").val(storedHeight);
        } else if (!/^extraImage/.test(resizeDrag.key)) {
          if (changeWidth) $("#targetTextWidth").val(storedWidth);
          if (changeHeight) $("#targetTextHeight").val(storedHeight);
        }
      }
      let liveSize = {
        transform: elementTransform(
          resizeDrag.section,
          resizeDrag.key,
          resizeDrag.startPosition.x,
          resizeDrag.startPosition.y,
        ),
      };
      if (changeWidth)
        $.extend(liveSize, {
          width: width + "px",
          minWidth: 0,
          maxWidth: "none",
        });
      if (changeHeight)
        $.extend(liveSize, {
          height: height + "px",
          minHeight: 0,
          maxHeight: "none",
        });
      $(resizeDrag.node).css(liveSize);
      let resizedRect = resizeDrag.node.getBoundingClientRect(),
        startRect = resizeDrag.startRect;
      let adjustX =
        resizeDrag.direction.indexOf("w") >= 0
          ? startRect.right - resizedRect.right
          : resizeDrag.direction.indexOf("e") >= 0
            ? startRect.left - resizedRect.left
            : (startRect.left +
                startRect.right -
                resizedRect.left -
                resizedRect.right) /
              2;
      let adjustY =
        resizeDrag.direction.indexOf("n") >= 0
          ? startRect.bottom - resizedRect.bottom
          : resizeDrag.direction.indexOf("s") >= 0
            ? startRect.top - resizedRect.top
            : (startRect.top +
                startRect.bottom -
                resizedRect.top -
                resizedRect.bottom) /
              2;
      let positionX = Math.round(
          resizeDrag.startPosition.x + adjustX / resizeDrag.scale,
        ),
        positionY = Math.round(
          resizeDrag.startPosition.y + adjustY / resizeDrag.scale,
        );
      setPosition(resizeDrag.section, resizeDrag.key, positionX, positionY);
      $(resizeDrag.node).css(
        "transform",
        elementTransform(
          resizeDrag.section,
          resizeDrag.key,
          positionX,
          positionY,
        ),
      );
      restoreStableElementAnchors(resizeDrag.stableAnchors);
      $("#positionX").val(positionX);
      $("#positionY").val(positionY);
      positionResizeHandles(
        $("#deviceScreen .canvas-resize-handle"),
        resizeDrag.node,
        $(resizeDrag.node).closest(".lp-section")[0],
      );
    });
    $(document).on(
      "pointerup.canvasResize pointercancel.canvasResize",
      function () {
        if (!resizeDrag) return;
        try {
          resizeDrag.handle.releasePointerCapture(resizeDrag.pointerId);
        } catch (ignore) {}
        resizeDrag = null;
        $("body").removeClass("direct-resizing");
        document.body.style.removeProperty("--resize-cursor");
        renderPage();
        renderEditor();
        renderStyle();
        markChanged();
      },
    );
    $("#deviceScreen").on("click", ".canvas-resize-handle", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    $("#deviceScreen").on("click", ".canvas-movable", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    $("#deviceScreen").on("click", ".lp-section", function (e) {
      if (suppressMarqueeClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressMarqueeClick = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      selectSection($(this).data("section-id"));
    });
    $("#positionX,#positionY").on("change", function () {
      let s = currentSection(),
        key = state.selectedElementKey;
      if (!s || !key) return;
      pushHistory();
      setPosition(s, key, $("#positionX").val(), $("#positionY").val());
      renderPage();
      renderEditor();
      markChanged();
    });
    $("#resetElementPositionBtn").on("click", function () {
      let entries = selectedEntries();
      if (!entries.length) return;
      mutateWithHistory(function () {
        entries.forEach(function (entry) {
          setPosition(entry.section, entry.key, 0, 0);
        });
      });
    });
    $("#bringElementToFrontBtn").on("click", function () {
      let entries = selectedEntries();
      if (!entries.length) return;
      mutateWithHistory(function () {
        let groups = {};
        entries.forEach(function (entry) {
          if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
          groups[entry.sectionId].push(entry);
        });
        Object.keys(groups).forEach(function (sectionId) {
          let section = groups[sectionId][0].section,
            maxZ = 1;
          section.elementStyles = section.elementStyles || {};
          Object.keys(section.elementStyles).forEach(function (key) {
            maxZ = Math.max(
              maxZ,
              Number(section.elementStyles[key].zIndex) || 1,
            );
          });
          groups[sectionId].forEach(function (entry) {
            section.elementStyles[entry.key] =
              section.elementStyles[entry.key] || {};
            section.elementStyles[entry.key].zIndex = maxZ + 1;
          });
        });
      });
      toast(
        entries.length > 1
          ? "선택한 요소들을 맨 위로 올렸습니다."
          : "선택 요소를 맨 위로 올렸습니다.",
      );
    });
    $("#reverseHorizontalOrderBtn").on("click", function () {
      let entries = selectedEntries().filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      });
      if (entries.length < 2) return;
      let frame = $("#deviceFrame")[0],
        frameRect = frame.getBoundingClientRect(),
        scale = frameRect.width / frame.offsetWidth || 1,
        preventOverlap = $("#preventLineAlignOverlap").prop("checked");
      let groups = {};
      entries.forEach(function (entry) {
        if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
        groups[entry.sectionId].push(entry);
      });
      pushHistory();
      Object.keys(groups).forEach(function (sectionId) {
        let group = groups[sectionId];
        if (group.length < 2) return;
        let ordered = group
          .map(function (entry) {
            return { entry: entry, rect: entry.node.getBoundingClientRect() };
          })
          .sort(function (a, b) {
            return (
              (a.rect.left + a.rect.right) / 2 -
              (b.rect.left + b.rect.right) / 2
            );
          });
        let groupLeft = Math.min.apply(
            null,
            ordered.map(function (item) {
              return item.rect.left;
            }),
          ),
          groupRight = Math.max.apply(
            null,
            ordered.map(function (item) {
              return item.rect.right;
            }),
          );
        let gaps = [];
        for (let i = 1; i < ordered.length; i++) {
          let gap = ordered[i].rect.left - ordered[i - 1].rect.right;
          gaps.push(preventOverlap ? Math.max(8 * scale, gap) : gap);
        }
        let reversed = ordered.slice().reverse(),
          reversedGaps = gaps.slice().reverse(),
          totalWidth = reversed.reduce(function (sum, item) {
            return sum + item.rect.width;
          }, 0);
        totalWidth += reversedGaps.reduce(function (sum, gap) {
          return sum + gap;
        }, 0);
        let cursor = (groupLeft + groupRight) / 2 - totalWidth / 2;
        reversed.forEach(function (item, index) {
          let deltaX = cursor - item.rect.left,
            p = getPosition(item.entry.section, item.entry.key);
          setPosition(
            item.entry.section,
            item.entry.key,
            p.x + deltaX / scale,
            p.y,
          );
          cursor += item.rect.width;
          if (index < reversedGaps.length) cursor += reversedGaps[index];
        });
      });
      renderPage();
      renderEditor();
      markChanged();
      toast(
        "선택 요소의 좌우 순서를 바꿨습니다." +
          (preventOverlap ? " 요소 간격을 유지했습니다." : ""),
      );
    });
    $("#reverseVerticalOrderBtn").on("click", function () {
      let entries = selectedEntries().filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      });
      if (entries.length < 2) return;
      let frame = $("#deviceFrame")[0],
        frameRect = frame.getBoundingClientRect(),
        scale = frameRect.width / frame.offsetWidth || 1,
        preventOverlap = $("#preventLineAlignOverlap").prop("checked");
      let groups = {};
      entries.forEach(function (entry) {
        if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
        groups[entry.sectionId].push(entry);
      });
      pushHistory();
      Object.keys(groups).forEach(function (sectionId) {
        let group = groups[sectionId];
        if (group.length < 2) return;
        let ordered = group
          .map(function (entry) {
            return { entry: entry, rect: entry.node.getBoundingClientRect() };
          })
          .sort(function (a, b) {
            return (
              (a.rect.top + a.rect.bottom) / 2 -
              (b.rect.top + b.rect.bottom) / 2
            );
          });
        let groupTop = Math.min.apply(
            null,
            ordered.map(function (item) {
              return item.rect.top;
            }),
          ),
          groupBottom = Math.max.apply(
            null,
            ordered.map(function (item) {
              return item.rect.bottom;
            }),
          );
        let gaps = [];
        for (let i = 1; i < ordered.length; i++) {
          let gap = ordered[i].rect.top - ordered[i - 1].rect.bottom;
          gaps.push(preventOverlap ? Math.max(8 * scale, gap) : gap);
        }
        let reversed = ordered.slice().reverse(),
          reversedGaps = gaps.slice().reverse(),
          totalHeight = reversed.reduce(function (sum, item) {
            return sum + item.rect.height;
          }, 0);
        totalHeight += reversedGaps.reduce(function (sum, gap) {
          return sum + gap;
        }, 0);
        let cursor = (groupTop + groupBottom) / 2 - totalHeight / 2;
        reversed.forEach(function (item, index) {
          let deltaY = cursor - item.rect.top,
            position = getPosition(item.entry.section, item.entry.key);
          setPosition(
            item.entry.section,
            item.entry.key,
            position.x,
            position.y + deltaY / scale,
          );
          cursor += item.rect.height;
          if (index < reversedGaps.length) cursor += reversedGaps[index];
        });
      });
      renderPage();
      renderEditor();
      renderStyle();
      markChanged();
      toast(
        "선택 요소의 상하 순서를 바꿨습니다." +
          (preventOverlap ? " 요소 간격을 유지했습니다." : ""),
      );
    });
    $("#multiLineAlignActions").on("click", "button", function () {
      let mode = $(this).data("line-align");
      let entries = selectedEntries().filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      });
      if (entries.length < 2) return;
      let frame = $("#deviceFrame")[0],
        frameRect = frame.getBoundingClientRect(),
        scale = frameRect.width / frame.offsetWidth || 1;
      let preventOverlap = $("#preventLineAlignOverlap").prop("checked");
      let groups = {};
      entries.forEach(function (entry) {
        if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
        groups[entry.sectionId].push(entry);
      });
      pushHistory();
      Object.keys(groups).forEach(function (sectionId) {
        let group = groups[sectionId];
        if (group.length < 2) return;
        let rects = group.map(function (entry) {
          return entry.node.getBoundingClientRect();
        });
        let groupLeft = Math.min.apply(
            null,
            rects.map(function (rect) {
              return rect.left;
            }),
          ),
          groupRight = Math.max.apply(
            null,
            rects.map(function (rect) {
              return rect.right;
            }),
          ),
          groupTop = Math.min.apply(
            null,
            rects.map(function (rect) {
              return rect.top;
            }),
          ),
          groupBottom = Math.max.apply(
            null,
            rects.map(function (rect) {
              return rect.bottom;
            }),
          );
        let adjustments = group.map(function (entry, index) {
          let rect = rects[index],
            deltaX = 0,
            deltaY = 0;
          if (mode === "left") deltaX = groupLeft - rect.left;
          else if (mode === "center-x")
            deltaX =
              (groupLeft + groupRight) / 2 - (rect.left + rect.right) / 2;
          else if (mode === "right") deltaX = groupRight - rect.right;
          else if (mode === "top") deltaY = groupTop - rect.top;
          else if (mode === "middle-y")
            deltaY =
              (groupTop + groupBottom) / 2 - (rect.top + rect.bottom) / 2;
          else if (mode === "bottom") deltaY = groupBottom - rect.bottom;
          return {
            entry: entry,
            rect: rect,
            deltaX: deltaX,
            deltaY: deltaY,
          };
        });
        if (preventOverlap) {
          let verticalLine = ["left", "center-x", "right"].indexOf(mode) >= 0;
          let ordered = adjustments.slice().sort(function (a, b) {
            return verticalLine
              ? (a.rect.top + a.rect.bottom) / 2 -
                  (b.rect.top + b.rect.bottom) / 2
              : (a.rect.left + a.rect.right) / 2 -
                  (b.rect.left + b.rect.right) / 2;
          });
          let gap = 8 * scale,
            cursor = null;
          ordered.forEach(function (item) {
            let start = verticalLine
                ? item.rect.top + item.deltaY
                : item.rect.left + item.deltaX,
              end = verticalLine
                ? item.rect.bottom + item.deltaY
                : item.rect.right + item.deltaX;
            if (cursor !== null && start < cursor + gap) {
              let shift = cursor + gap - start;
              if (verticalLine) item.deltaY += shift;
              else item.deltaX += shift;
              end += shift;
            }
            cursor = end;
          });
          let finalStart = Math.min.apply(
              null,
              adjustments.map(function (item) {
                return verticalLine
                  ? item.rect.top + item.deltaY
                  : item.rect.left + item.deltaX;
              }),
            ),
            finalEnd = Math.max.apply(
              null,
              adjustments.map(function (item) {
                return verticalLine
                  ? item.rect.bottom + item.deltaY
                  : item.rect.right + item.deltaX;
              }),
            ),
            originalCenter = verticalLine
              ? (groupTop + groupBottom) / 2
              : (groupLeft + groupRight) / 2,
            recenter = originalCenter - (finalStart + finalEnd) / 2;
          adjustments.forEach(function (item) {
            if (verticalLine) item.deltaY += recenter;
            else item.deltaX += recenter;
          });
        }
        adjustments.forEach(function (item) {
          let entry = item.entry;
          let p = getPosition(entry.section, entry.key);
          setPosition(
            entry.section,
            entry.key,
            p.x + item.deltaX / scale,
            p.y + item.deltaY / scale,
          );
        });
      });
      renderPage();
      renderEditor();
      markChanged();
      let lineNames = {
        left: "왼쪽선",
        "center-x": "가로 중심선",
        right: "오른쪽선",
        top: "위쪽선",
        "middle-y": "세로 중심선",
        bottom: "아래쪽선",
      };
      toast(
        "선택 요소를 " +
          lineNames[mode] +
          "에 맞췄습니다." +
          (preventOverlap ? " 겹침을 자동으로 정리했습니다." : ""),
      );
    });
    function elementGapValue(selector) {
      let value = Number($(selector).val());
      if (!Number.isFinite(value)) value = 12;
      value = Math.max(0, Math.min(500, Math.round(value)));
      $(selector).val(value);
      return value;
    }
    let spacingEditInput = null;
    function applySelectedElementGap(axis, inputNode) {
      let entries = selectedEntries().filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      });
      if (entries.length < 2) return;
      let groups = {},
        gapValue = elementGapValue(
          axis === "x" ? "#horizontalElementGap" : "#verticalElementGap",
        );
      entries.forEach(function (entry) {
        if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
        groups[entry.sectionId].push(entry);
      });
      let applicableGroups = Object.keys(groups).filter(function (sectionId) {
        return groups[sectionId].length >= 2;
      });
      if (!applicableGroups.length) return;
      if (spacingEditInput !== inputNode) {
        pushHistory();
        spacingEditInput = inputNode;
      }
      applicableGroups.forEach(function (sectionId) {
        let group = groups[sectionId],
          sectionNode = $(group[0].node).closest(".lp-section")[0];
        if (!sectionNode) return;
        let sectionRect = sectionNode.getBoundingClientRect(),
          scale = sectionNode.offsetWidth
            ? sectionRect.width / sectionNode.offsetWidth
            : 1;
        scale = scale || 1;
        let ordered = group
          .map(function (entry) {
            return { entry: entry, rect: entry.node.getBoundingClientRect() };
          })
          .sort(function (a, b) {
            return axis === "x"
              ? (a.rect.left + a.rect.right) / 2 -
                  (b.rect.left + b.rect.right) / 2
              : (a.rect.top + a.rect.bottom) / 2 -
                  (b.rect.top + b.rect.bottom) / 2;
          });
        let gap = gapValue * scale,
          totalSize = ordered.reduce(function (sum, item) {
            return sum + (axis === "x" ? item.rect.width : item.rect.height);
          }, 0);
        totalSize += gap * (ordered.length - 1);
        let groupStart = Math.min.apply(
            null,
            ordered.map(function (item) {
              return axis === "x" ? item.rect.left : item.rect.top;
            }),
          ),
          groupEnd = Math.max.apply(
            null,
            ordered.map(function (item) {
              return axis === "x" ? item.rect.right : item.rect.bottom;
            }),
          ),
          sectionStart = axis === "x" ? sectionRect.left : sectionRect.top,
          sectionEnd = axis === "x" ? sectionRect.right : sectionRect.bottom,
          inset = 8 * scale,
          available = sectionEnd - sectionStart - inset * 2,
          cursor = (groupStart + groupEnd - totalSize) / 2;
        if (totalSize <= available)
          cursor = Math.max(
            sectionStart + inset,
            Math.min(sectionEnd - inset - totalSize, cursor),
          );
        else cursor = (sectionStart + sectionEnd - totalSize) / 2;
        ordered.forEach(function (item) {
          let currentStart = axis === "x" ? item.rect.left : item.rect.top,
            delta = (cursor - currentStart) / scale,
            position = getPosition(item.entry.section, item.entry.key);
          setPosition(
            item.entry.section,
            item.entry.key,
            axis === "x" ? position.x + delta : position.x,
            axis === "y" ? position.y + delta : position.y,
          );
          cursor +=
            (axis === "x" ? item.rect.width : item.rect.height) + gap;
        });
      });
      renderPage();
      renderEditor();
      renderStyle();
      markChanged();
    }
    $("#horizontalElementGap,#verticalElementGap")
      .on("input", function () {
        if (this.value === "") return;
        applySelectedElementGap(
          this.id === "horizontalElementGap" ? "x" : "y",
          this,
        );
      })
      .on("change", function () {
        elementGapValue("#" + this.id);
      })
      .on("blur", function () {
        if (spacingEditInput === this) spacingEditInput = null;
      });
    $("#gridLayoutActions").on("click", "button", function () {
      let columns = Math.max(1, Number($(this).data("grid-columns")) || 1);
      let horizontalGap = elementGapValue("#horizontalElementGap"),
        verticalGap = elementGapValue("#verticalElementGap");
      let entries = selectedEntries().filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      });
      if (entries.length < 2) return;
      let groups = {};
      entries.forEach(function (entry) {
        if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
        groups[entry.sectionId].push(entry);
      });
      pushHistory();
      Object.keys(groups).forEach(function (sectionId) {
        let group = groups[sectionId];
        if (group.length < 2) return;
        let sectionNode = $(group[0].node).closest(".lp-section")[0];
        if (!sectionNode) return;
        let sectionRect = sectionNode.getBoundingClientRect(),
          scale = sectionNode.offsetWidth
            ? sectionRect.width / sectionNode.offsetWidth
            : 1;
        scale = scale || 1;
        let ordered = group
          .map(function (entry) {
            return { entry: entry, rect: entry.node.getBoundingClientRect() };
          })
          .sort(function (a, b) {
            let rowThreshold = Math.min(a.rect.height, b.rect.height) * 0.45;
            return Math.abs(a.rect.top - b.rect.top) > rowThreshold
              ? a.rect.top - b.rect.top
              : a.rect.left - b.rect.left;
          });
        let groupLeft = Math.min.apply(
            null,
            ordered.map(function (item) {
              return item.rect.left;
            }),
          ),
          groupRight = Math.max.apply(
            null,
            ordered.map(function (item) {
              return item.rect.right;
            }),
          ),
          groupTop = Math.min.apply(
            null,
            ordered.map(function (item) {
              return item.rect.top;
            }),
          ),
          groupBottom = Math.max.apply(
            null,
            ordered.map(function (item) {
              return item.rect.bottom;
            }),
          ),
          cellWidth = Math.max.apply(
            null,
            ordered.map(function (item) {
              return item.rect.width;
            }),
          ),
          cellHeight = Math.max.apply(
            null,
            ordered.map(function (item) {
              return item.rect.height;
            }),
          ),
          actualColumns = Math.min(columns, ordered.length),
          rows = Math.ceil(ordered.length / actualColumns),
          gapX = horizontalGap * scale,
          gapY = verticalGap * scale,
          gridWidth =
            actualColumns * cellWidth + (actualColumns - 1) * gapX,
          gridHeight = rows * cellHeight + (rows - 1) * gapY,
          startLeft = (groupLeft + groupRight - gridWidth) / 2,
          startTop = (groupTop + groupBottom - gridHeight) / 2,
          inset = 8 * scale,
          availableWidth = sectionRect.width - inset * 2,
          availableHeight = sectionRect.height - inset * 2;
        if (gridWidth <= availableWidth)
          startLeft = Math.max(
            sectionRect.left + inset,
            Math.min(sectionRect.right - inset - gridWidth, startLeft),
          );
        else startLeft = (sectionRect.left + sectionRect.right - gridWidth) / 2;
        if (gridHeight <= availableHeight)
          startTop = Math.max(
            sectionRect.top + inset,
            Math.min(sectionRect.bottom - inset - gridHeight, startTop),
          );
        else startTop = (sectionRect.top + sectionRect.bottom - gridHeight) / 2;

        ordered.forEach(function (item, index) {
          let row = Math.floor(index / actualColumns),
            column = index % actualColumns,
            rowItemCount = Math.min(
              actualColumns,
              ordered.length - row * actualColumns,
            ),
            rowOffset =
              ((actualColumns - rowItemCount) * (cellWidth + gapX)) / 2,
            targetLeft =
              startLeft +
              rowOffset +
              column * (cellWidth + gapX) +
              (cellWidth - item.rect.width) / 2,
            targetTop =
              startTop +
              row * (cellHeight + gapY) +
              (cellHeight - item.rect.height) / 2,
            position = getPosition(item.entry.section, item.entry.key);
          setPosition(
            item.entry.section,
            item.entry.key,
            position.x + (targetLeft - item.rect.left) / scale,
            position.y + (targetTop - item.rect.top) / scale,
          );
        });
      });
      renderPage();
      renderEditor();
      renderStyle();
      markChanged();
      toast(
        "선택 요소를 " +
          Math.min(columns, entries.length) +
          "×" +
          Math.ceil(entries.length / Math.min(columns, entries.length)) +
          " 격자로 배치했습니다.",
      );
    });
    $("#multiAlignActions").on("click", "button", function () {
      let mode = $(this).data("align");
      let entries = selectedEntries().filter(function (entry) {
        return entry.node && $(entry.node).is(":visible");
      });
      if (!entries.length) return;
      let frame = $("#deviceFrame")[0],
        frameRect = frame.getBoundingClientRect(),
        scale = frameRect.width / frame.offsetWidth || 1;
      let groups = {};
      entries.forEach(function (entry) {
        if (!groups[entry.sectionId]) groups[entry.sectionId] = [];
        groups[entry.sectionId].push(entry);
      });
      pushHistory();
      Object.keys(groups).forEach(function (sectionId) {
        let group = groups[sectionId];
        let rects = group.map(function (entry) {
          return entry.node.getBoundingClientRect();
        });
        let groupLeft = Math.min.apply(
          null,
          rects.map(function (rect) {
            return rect.left;
          }),
        );
        let groupRight = Math.max.apply(
          null,
          rects.map(function (rect) {
            return rect.right;
          }),
        );
        let groupTop = Math.min.apply(
          null,
          rects.map(function (rect) {
            return rect.top;
          }),
        );
        let groupBottom = Math.max.apply(
          null,
          rects.map(function (rect) {
            return rect.bottom;
          }),
        );
        let sectionRect = $(group[0].node)
          .closest(".lp-section")[0]
          .getBoundingClientRect();
        let inset = 8 * scale,
          deltaX = 0,
          deltaY = 0;
        if (mode === "left") deltaX = sectionRect.left + inset - groupLeft;
        else if (mode === "right")
          deltaX = sectionRect.right - inset - groupRight;
        else if (mode === "center")
          deltaX =
            (sectionRect.left + sectionRect.right) / 2 -
            (groupLeft + groupRight) / 2;
        else if (mode === "top")
          deltaY = sectionRect.top + inset - groupTop;
        else if (mode === "bottom")
          deltaY = sectionRect.bottom - inset - groupBottom;
        else if (mode === "middle")
          deltaY =
            (sectionRect.top + sectionRect.bottom) / 2 -
            (groupTop + groupBottom) / 2;
        group.forEach(function (entry) {
          let p = getPosition(entry.section, entry.key);
          setPosition(
            entry.section,
            entry.key,
            p.x + deltaX / scale,
            p.y + deltaY / scale,
          );
        });
      });
      renderPage();
      renderEditor();
      markChanged();
      let targetName = entries.length > 1 ? "선택 묶음" : "선택 요소";
      let alignNames = {
        left: "왼쪽",
        center: "가로 중앙",
        right: "오른쪽",
        top: "위쪽",
        middle: "세로 중앙",
        bottom: "아래쪽",
      };
      let objectParticle = entries.length > 1 ? "을 " : "를 ";
      toast(
        targetName + objectParticle + alignNames[mode] + "으로 배치했습니다.",
      );
    });
    $("#resetSectionPositionsBtn").on("click", function () {
      let s = currentSection();
      if (!s) return;
      mutateWithHistory(function () {
        s.positions = {};
      });
    });

    $("#translationBtn").on("click", function () {
      translationController.openAll();
    });
    $("#textFieldsList").on("click", "[data-translate-text-key]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      translationController.openSingle({
        sectionId: currentSection().id,
        key: String($(this).data("translate-text-key") || ""),
        label: String($(this).data("translate-label") || "텍스트"),
      });
    });
    $("#buttonFieldsList").on("click", "[data-translate-button-index]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      let index = Number($(this).data("translate-button-index"));
      translationController.openSingle({
        sectionId: currentSection().id,
        key: index === 0 ? "button" : "button" + index,
        label: String($(this).data("translate-label") || "버튼"),
      });
    });
    $("#runTranslationBtn").on("click", function () {
      translationController.run();
    });
    $("#restoreOriginalTextBtn").on("click", function () {
      translationController.restoreCurrent();
    });

    $("#addSectionBtn").on("click", function () {
      $("#sectionModal").prop("hidden", false);
    });
    $("[data-close-modal]").on("click", function () {
      $(this).closest(".modal-backdrop").prop("hidden", true);
    });
    $(".modal-backdrop").on("click", function (e) {
      if (e.target === this) $(this).prop("hidden", true);
    });
    $(document).on("click", ".section-type-card", function () {
      let type = $(this).data("type");
      mutateWithHistory(function () {
        let s = createEmptySection(type);
        currentTemplate().sections.push(s);
        state.selectedSectionId = s.id;
        state.selectedElementKey = null;
        state.selectedElements = [];
      });
      $("#sectionModal").prop("hidden", true);
    });

    $("#undoBtn").on("click", function () {
      if (!state.history.length) return;
      state.future.push(snapshot());
      restore(state.history.pop());
    });
    $("#redoBtn").on("click", function () {
      if (!state.future.length) return;
      state.history.push(snapshot());
      restore(state.future.pop());
    });
    $("#previewBtn").on("click", openPreview);
    $("#importJspBtn").on("click", function () {
      $("#importJspInput").val("").trigger("click");
    });
    $("#importJspInput").on("change", async function () {
      let file = this.files && this.files[0];
      if (!file) return;
      $("#importJspBtn").prop("disabled", true);
      try {
        await importJspFile(file);
      } catch (error) {
        toast("편집기 복원 데이터가 포함된 JSP 파일이 아닙니다.");
      } finally {
        $("#importJspBtn").prop("disabled", false);
        this.value = "";
      }
    });
    $("#closePreviewBtn").on("click", function () {
      $("#previewOverlay").prop("hidden", true);
    });
    $("#previewDownloadBtn,#publishBtn").on("click", openDownloadTypeModal);
    $(document).on("click", "[data-download-type]", function () {
      downloadJsp($(this).attr("data-download-type"));
    });
    $("#copySelectedElementsBtn").on("click", copySelectedElements);
    $("#pasteElementsBtn").on("click", pasteCopiedElements);
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") {
        $(".modal-backdrop,#previewOverlay").prop("hidden", true);
      }
      let isEditing = $(e.target).closest(
        'input,textarea,select,[contenteditable="true"]',
      ).length;
      let shortcutKey = String(e.key || "").toLowerCase();
      if (
        (e.ctrlKey || e.metaKey) &&
        !isEditing &&
        !$(".modal-backdrop:visible").length &&
        !$("#previewOverlay").is(":visible")
      ) {
        if (shortcutKey === "0") {
          e.preventDefault();
          changeZoom(100);
          return;
        }
        if (shortcutKey === "+" || shortcutKey === "=") {
          e.preventDefault();
          changeZoom(state.zoom + 10);
          return;
        }
        if (shortcutKey === "-" || shortcutKey === "subtract") {
          e.preventDefault();
          changeZoom(state.zoom - 10);
          return;
        }
        if (shortcutKey === "c" && copySelectedElements()) {
          e.preventDefault();
          return;
        }
        if (shortcutKey === "v" && pasteCopiedElements()) {
          e.preventDefault();
          return;
        }
      }
      if (
        (e.key === "Delete" || e.key === "Del") &&
        !isEditing
      ) {
        if (
          $(".modal-backdrop:visible").length ||
          $("#previewOverlay").is(":visible")
        )
          return;
        let entries = selectedEntries();
        if (entries.length) {
          e.preventDefault();
          deleteSelectedElements(entries);
          return;
        }
        if (state.selectedElements.length) {
          e.preventDefault();
          clearSelection();
          return;
        }
        let section = currentSection();
        if (section) {
          e.preventDefault();
          deleteSectionById(section.id);
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? $("#redoBtn").click() : $("#undoBtn").click();
        return;
      }
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) >=
          0 &&
        !$(e.target).is("input,textarea,select")
      ) {
        let entries = selectedEntries();
        if (!entries.length) return;
        e.preventDefault();
        pushHistory();
        let step = e.shiftKey ? 10 : 1;
        entries.forEach(function (entry) {
          let p = getPosition(entry.section, entry.key);
          if (e.key === "ArrowLeft") p.x -= step;
          if (e.key === "ArrowRight") p.x += step;
          if (e.key === "ArrowUp") p.y -= step;
          if (e.key === "ArrowDown") p.y += step;
          setPosition(entry.section, entry.key, p.x, p.y);
        });
        renderPage();
        renderEditor();
        markChanged();
      }
    });
  }

  init();
})(jQuery);
