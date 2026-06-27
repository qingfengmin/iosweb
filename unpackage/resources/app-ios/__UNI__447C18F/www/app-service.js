(function(vue) {
  "use strict";
  const _imports_0 = "/static/logo.png";
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props) {
      function openAiChat() {
        uni.navigateTo({
          url: "/pages/ai-chat/ai-chat"
        });
      }
      return (_ctx = null, _cache = null) => {
        return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({ class: "content" }), [
          vue.createElementVNode("image", new UTSJSONObject({
            class: "logo",
            src: _imports_0
          })),
          vue.createElementVNode("view", new UTSJSONObject({ class: "text-area" }), [
            vue.createElementVNode("text", new UTSJSONObject({ class: "title" }), "Hello")
          ]),
          vue.createElementVNode("button", new UTSJSONObject({
            class: "entry-btn",
            onClick: openAiChat
          }), "进入 AI 对话")
        ]);
      };
    }
  });
  const _style_0$2 = { "content": { "": { "display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center" } }, "logo": { "": { "width": "200rpx", "height": "200rpx", "marginTop": "200rpx", "marginBottom": "50rpx" } }, "text-area": { "": { "display": "flex", "justifyContent": "center" } }, "title": { "": { "fontSize": "36rpx", "color": "#8f8f94" } }, "entry-btn": { "": { "marginTop": "80rpx", "width": "450rpx", "backgroundColor": "#3b82f6", "color": "#ffffff", "fontSize": "30rpx" } } };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["styles", [_style_0$2]]]);
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  class MsgBlock extends UTS.UTSType {
    static get$UTSMetadata$() {
      return {
        kind: 2,
        get fields() {
          return {
            type: { type: String, optional: false },
            text: { type: String, optional: false },
            lang: { type: String, optional: true }
          };
        }
      };
    }
    constructor(options, metadata = MsgBlock.get$UTSMetadata$(), isJSONParse = false) {
      super();
      this.__props__ = UTS.UTSType.initProps(options, metadata, isJSONParse);
      this.type = this.__props__.type;
      this.text = this.__props__.text;
      this.lang = this.__props__.lang;
      delete this.__props__;
    }
  }
  class ChatMsg extends UTS.UTSType {
    static get$UTSMetadata$() {
      return {
        kind: 2,
        get fields() {
          return {
            role: { type: String, optional: false },
            content: { type: String, optional: false },
            time: { type: String, optional: false },
            blocks: { type: "Unknown", optional: false }
          };
        }
      };
    }
    constructor(options, metadata = ChatMsg.get$UTSMetadata$(), isJSONParse = false) {
      super();
      this.__props__ = UTS.UTSType.initProps(options, metadata, isJSONParse);
      this.role = this.__props__.role;
      this.content = this.__props__.content;
      this.time = this.__props__.time;
      this.blocks = this.__props__.blocks;
      delete this.__props__;
    }
  }
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "ai-chat",
    setup(__props) {
      const messageList = vue.ref([]);
      const inputText = vue.ref("");
      const scrollTop = vue.ref(99999);
      function scrollToBottom() {
        scrollTop.value = scrollTop.value > 99998 ? scrollTop.value + 1 : 99999;
      }
      const keyboardBottom = vue.ref(0);
      const mcpOpen = vue.ref(false);
      const apiBase = vue.ref("http://192.168.123.2:8000");
      const showSidebar = vue.ref(false);
      const showSkillDropdown = vue.ref(false);
      const isFirstMessage = vue.ref(true);
      const sessionId = vue.ref("");
      const mcpServers = vue.ref([]);
      const historySessions = vue.ref([]);
      const activeToolCount = vue.ref(0);
      const keyboardCallback = (res) => {
        keyboardBottom.value = res.height;
      };
      uni.onKeyboardHeightChange(keyboardCallback);
      function getTimeStr() {
        const now = /* @__PURE__ */ new Date();
        const h = now.getHours().toString().padStart(2, "0");
        const m = now.getMinutes().toString().padStart(2, "0");
        return h + ":" + m;
      }
      function parseBlocks(text) {
        const result = [];
        const lines = text.split("\n");
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          if (line.startsWith("```")) {
            const lang = line.slice(3).trim();
            i++;
            let codeText = "";
            while (i < lines.length && !lines[i].startsWith("```")) {
              if (codeText !== "")
                codeText += "\n";
              codeText += lines[i];
              i++;
            }
            if (codeText !== "") {
              result.push(new MsgBlock({ type: "code", text: codeText, lang: lang !== "" ? lang : void 0 }));
            }
            if (i < lines.length && lines[i].startsWith("```")) {
              i++;
            }
          } else {
            let plainLines = [];
            while (i < lines.length && !lines[i].startsWith("```")) {
              plainLines.push(lines[i]);
              i++;
            }
            const plain = plainLines.join("\n");
            if (plain.trim() !== "") {
              result.push(new MsgBlock({
                lang: null,
                type: "text",
                text: plain
              }));
            } else if (plain !== "") {
              result.push(new MsgBlock({
                lang: null,
                type: "text",
                text: plain
              }));
            }
          }
        }
        if (result.length === 0) {
          result.push(new MsgBlock({
            lang: null,
            type: "text",
            text
          }));
        }
        return result;
      }
      function makeMsg(role, content) {
        return new ChatMsg({
          role,
          content,
          time: getTimeStr(),
          blocks: parseBlocks(content)
        });
      }
      function apiRequest(url, method, body = null) {
        return new Promise((resolve, reject) => {
          const opt = new UTSJSONObject({
            url: apiBase.value + url,
            method,
            header: new UTSJSONObject({ "Content-Type": "application/json" }),
            success: (res = null) => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(res.data);
              } else {
                reject(new Error("HTTP " + res.statusCode));
              }
            },
            fail: (err = null) => {
              reject(err);
            }
          });
          if (body !== void 0) {
            opt.data = body;
          }
          uni.request(opt);
        });
      }
      function fetchSessions() {
        apiRequest("/api/chat/sessions", "GET").then((data = null) => {
          const list = data.sessions || [];
          historySessions.value = list.map((s = null) => {
            return new UTSJSONObject({
              session_id: s.session_id || s.id || "",
              title: s.title || "新会话",
              time: s.updated_at || s.created_at || ""
            });
          });
        }).catch((e = null) => {
          uni.__log__("log", "at pages/ai-chat/ai-chat.uvue:318", "fetch sessions error:", e);
        });
      }
      function createSessionOnServer() {
        return new Promise((resolve, reject) => {
          apiRequest("/api/chat/sessions", "POST").then((data = null) => {
            if (data.session_id || data.id) {
              resolve(data.session_id || data.id);
            } else {
              resolve("");
            }
          }).catch((e = null) => {
            reject(e);
          });
        });
      }
      function loadSessionMessages(sid) {
        apiRequest("/api/chat/sessions/" + sid + "/messages", "GET").then((data = null) => {
          const raw = data.messages || [];
          const newMsgs = [];
          for (let i = 0; i < raw.length; i++) {
            const m = raw[i];
            const r = m.role || "user";
            const role = r === "assistant" || r === "ai" ? "ai" : "user";
            newMsgs.push(makeMsg(role, m.content || ""));
          }
          messageList.value = newMsgs;
          isFirstMessage.value = false;
          setTimeout(() => {
            scrollToBottom();
          }, 200);
        }).catch((e = null) => {
          messageList.value = [makeMsg("ai", "加载历史消息失败")];
          isFirstMessage.value = false;
        });
      }
      function deleteSessionOnServer(sid) {
        return apiRequest("/api/chat/sessions/" + sid, "DELETE");
      }
      function fetchMcpServers() {
        apiRequest("/api/mcp/servers", "GET").then((data = null) => {
          mcpServers.value = data.servers || [];
          updateToolCount();
        }).catch((e = null) => {
          uni.__log__("log", "at pages/ai-chat/ai-chat.uvue:371", "fetch mcp error:", e);
        });
      }
      function updateToolCount() {
        var e_1, _a;
        let count = 0;
        try {
          for (var _b = __values(mcpServers.value), _c = _b.next(); !_c.done; _c = _b.next()) {
            var srv = _c.value;
            if (srv.enabled && srv.connected) {
              const tools = srv.tools || new UTSJSONObject({});
              for (const k in tools) {
                if (tools[k])
                  count++;
              }
            }
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return))
              _a.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        activeToolCount.value = count;
      }
      vue.onLoad((option) => {
        if (option && option.apiBase) {
          apiBase.value = option.apiBase;
        }
        fetchSessions();
      });
      function toggleMcp() {
        mcpOpen.value = !mcpOpen.value;
        if (mcpOpen.value) {
          fetchMcpServers();
        }
      }
      function toggleSidebar() {
        showSidebar.value = !showSidebar.value;
        if (showSidebar.value) {
          fetchSessions();
        }
      }
      function toggleSkillDropdown() {
        showSkillDropdown.value = !showSkillDropdown.value;
      }
      function startNewChat() {
        messageList.value = [];
        sessionId.value = "";
        isFirstMessage.value = true;
        showSidebar.value = false;
      }
      function loadSession(idx) {
        const session = historySessions.value[idx];
        if (!session || !session.session_id)
          return null;
        sessionId.value = session.session_id;
        isFirstMessage.value = false;
        showSidebar.value = false;
        loadSessionMessages(session.session_id);
      }
      function deleteSession(idx) {
        const session = historySessions.value[idx];
        if (!session || !session.session_id)
          return null;
        deleteSessionOnServer(session.session_id).then(() => {
          if (sessionId.value === session.session_id) {
            sessionId.value = "";
            isFirstMessage.value = true;
            messageList.value = [];
          }
          fetchSessions();
        }).catch((e = null) => {
          uni.__log__("log", "at pages/ai-chat/ai-chat.uvue:442", "delete error:", e);
        });
      }
      function addMsg(msg) {
        const newMsgs = [];
        for (let i = 0; i < messageList.value.length; i++) {
          newMsgs.push(messageList.value[i]);
        }
        newMsgs.push(msg);
        messageList.value = newMsgs;
        scrollToBottom();
      }
      function quickSend(text) {
        inputText.value = text;
      }
      function useSkill(text) {
        showSkillDropdown.value = false;
        inputText.value = text;
      }
      function summarizeToKnowledge() {
        if (messageList.value.length === 0) {
          uni.showToast({ title: "当前会话没有消息，无法总结", icon: "none" });
          return null;
        }
        inputText.value = "请使用 save_conversation_as_knowledge 工具总结当前对话并保存到知识库";
      }
      function getToolCount(srv = null) {
        const tools = srv.tools || new UTSJSONObject({});
        let n = 0;
        for (const k in tools) {
          if (tools[k])
            n++;
        }
        return n;
      }
      function toggleServer(idx) {
        const srv = mcpServers.value[idx];
        if (!srv)
          return null;
        apiRequest("/api/mcp/server/toggle?name=" + encodeURIComponent(srv.name) + "&enabled=" + !srv.enabled, "POST").then((data = null) => {
          if (data.success) {
            mcpServers.value[idx] = data.server;
            updateToolCount();
          }
        }).catch((e = null) => {
          uni.showToast({ title: "切换失败", icon: "none" });
        });
      }
      function toggleTool(srvIdx, toolName, enabled) {
        const srv = mcpServers.value[srvIdx];
        if (!srv)
          return null;
        apiRequest("/api/mcp/tool/toggle", "POST", new UTSJSONObject({
          server_name: srv.name,
          tool_name: toolName,
          enabled
        })).then((data = null) => {
          if (data.success) {
            mcpServers.value[srvIdx] = data.server;
            updateToolCount();
          }
        }).catch((e = null) => {
          uni.__log__("log", "at pages/ai-chat/ai-chat.uvue:510", "toggle tool error:", e);
        });
      }
      function updateCwd(srvIdx, cwd) {
        const srv = mcpServers.value[srvIdx];
        if (!srv)
          return null;
        apiRequest("/api/mcp/server/cwd", "POST", new UTSJSONObject({
          name: srv.name,
          cwd
        })).then((data = null) => {
          if (data.success) {
            mcpServers.value[srvIdx] = data.server;
          }
        }).catch((e = null) => {
          uni.__log__("log", "at pages/ai-chat/ai-chat.uvue:525", "update cwd error:", e);
        });
      }
      function handleSend() {
        const text = inputText.value.trim();
        if (text === "")
          return null;
        addMsg(makeMsg("user", text));
        inputText.value = "";
        const aiMsgIdx = messageList.value.length;
        addMsg(makeMsg("ai", ""));
        function parseSSE(fullText) {
          const chunks = fullText.split("\n\n");
          let collected = "";
          for (let i = 0; i < chunks.length; i++) {
            const event = chunks[i].trim();
            if (!event)
              continue;
            const lines = event.split("\n");
            for (let j = 0; j < lines.length; j++) {
              const line = lines[j];
              if (line.startsWith("data: ")) {
                const payload = line.slice(6);
                if (payload === "[DONE]")
                  continue;
                try {
                  const obj = UTS.JSON.parse(payload);
                  if (obj.text)
                    collected += obj.text;
                } catch (e) {
                  if (!payload.startsWith("[THINKING]")) {
                    collected += payload;
                  }
                }
              } else if (line.startsWith("data:")) {
                const payload = line.slice(5).trim();
                if (payload === "[DONE]" || !payload)
                  continue;
                try {
                  const obj = UTS.JSON.parse(payload);
                  if (obj.text)
                    collected += obj.text;
                } catch (e) {
                  if (!payload.startsWith("[THINKING]")) {
                    collected += payload;
                  }
                }
              }
            }
          }
          return collected;
        }
        const doSend = (sid) => {
          sessionId.value = sid;
          uni.request({
            url: apiBase.value + "/chat",
            method: "POST",
            header: new UTSJSONObject({ "Content-Type": "application/json" }),
            data: new UTSJSONObject({ message: text, session_id: sid }),
            success: (res = null) => {
              let rawBody = "";
              if (typeof res.data === "string") {
                rawBody = res.data;
              } else if (res.data) {
                rawBody = UTS.JSON.stringify(res.data);
              }
              let collected = parseSSE(rawBody);
              if (collected === "" && rawBody) {
                collected = rawBody;
              }
              if (collected === "") {
                collected = "（后端无内容返回）";
              }
              if (aiMsgIdx < messageList.value.length) {
                messageList.value[aiMsgIdx] = makeMsg("ai", collected);
                const arr = messageList.value;
                arr.splice(0, 0);
                messageList.value = arr;
                scrollToBottom();
              }
              fetchSessions();
            },
            fail: (err = null) => {
              if (aiMsgIdx < messageList.value.length) {
                messageList.value[aiMsgIdx] = makeMsg("ai", "连接服务器失败，请检查网络或后端服务是否启动");
                const arr = messageList.value;
                arr.splice(0, 0);
                messageList.value = arr;
                scrollToBottom();
              }
            }
          });
        };
        if (!sessionId.value) {
          createSessionOnServer().then((sid) => {
            if (sid) {
              isFirstMessage.value = false;
              doSend(sid);
            } else {
              doSend("");
            }
          }).catch(() => {
            doSend("");
          });
        } else {
          doSend(sessionId.value);
        }
      }
      return (_ctx = null, _cache = null) => {
        return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({ class: "chat-page" }), [
          vue.createElementVNode("view", new UTSJSONObject({ class: "header" }), [
            vue.createElementVNode("view", new UTSJSONObject({ class: "header-left" }), [
              vue.createElementVNode("view", new UTSJSONObject({ class: "brand-icon" }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "brand-text" }), "AI")
              ]),
              vue.createElementVNode("text", new UTSJSONObject({ class: "brand-name" }), "AI 助手")
            ]),
            vue.createElementVNode("view", new UTSJSONObject({ class: "header-right" }), [
              vue.createElementVNode("view", new UTSJSONObject({
                class: vue.normalizeClass(["mcp-toggle", new UTSJSONObject({ active: vue.unref(mcpOpen) })]),
                onClick: toggleMcp
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-dot" }), "⚡"),
                vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-label" }), "MCP"),
                vue.unref(activeToolCount) > 0 ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                  key: 0,
                  class: "tool-count"
                }), vue.toDisplayString(vue.unref(activeToolCount)), 1)) : vue.createCommentVNode("", true)
              ], 2),
              vue.createElementVNode("view", new UTSJSONObject({
                class: "sidebar-toggle",
                onClick: toggleSidebar
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "menu-icon" }), "☰")
              ])
            ])
          ]),
          vue.createElementVNode("view", new UTSJSONObject({ class: "content-area" }), [
            vue.unref(showSidebar) ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
              key: 0,
              class: "sidebar-overlay",
              onClick: toggleSidebar
            }))) : vue.createCommentVNode("", true),
            vue.createElementVNode("view", new UTSJSONObject({
              class: vue.normalizeClass(["sidebar", new UTSJSONObject({ open: vue.unref(showSidebar) })])
            }), [
              vue.createElementVNode("view", new UTSJSONObject({ class: "sidebar-header" }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "sidebar-title" }), "会话历史"),
                vue.createElementVNode("view", new UTSJSONObject({
                  class: "new-chat-btn",
                  onClick: startNewChat
                }), [
                  vue.createElementVNode("text", new UTSJSONObject({ class: "new-chat-icon" }), "✕")
                ])
              ]),
              vue.createElementVNode("scroll-view", new UTSJSONObject({
                class: "sidebar-list",
                "scroll-y": ""
              }), [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(historySessions), (session, idx) => {
                  return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                    key: idx,
                    class: vue.normalizeClass(["session-item", new UTSJSONObject({ active: session.session_id === vue.unref(sessionId) })]),
                    onClick: ($event = null) => {
                      return loadSession(idx);
                    }
                  }), [
                    vue.createElementVNode("view", new UTSJSONObject({ class: "session-info" }), [
                      vue.createElementVNode("text", new UTSJSONObject({ class: "session-title" }), vue.toDisplayString(session.title), 1),
                      vue.createElementVNode("text", new UTSJSONObject({ class: "session-time" }), vue.toDisplayString(session.time), 1)
                    ]),
                    vue.createElementVNode("view", new UTSJSONObject({
                      class: "session-delete",
                      onClick: vue.withModifiers(($event = null) => {
                        return deleteSession(idx);
                      }, ["stop"])
                    }), [
                      vue.createElementVNode("text", new UTSJSONObject({ class: "delete-icon" }), "🗑")
                    ], 8, ["onClick"])
                  ], 10, ["onClick"]);
                }), 128)),
                vue.unref(historySessions).length === 0 ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                  key: 0,
                  class: "sidebar-empty"
                }), [
                  vue.createElementVNode("text", new UTSJSONObject({ class: "empty-text" }), "暂无历史记录")
                ])) : vue.createCommentVNode("", true)
              ])
            ], 2),
            vue.unref(mcpOpen) ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
              key: 1,
              class: "mcp-panel"
            }), [
              vue.createElementVNode("view", new UTSJSONObject({ class: "mcp-header" }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-title" }), "MCP 服务器"),
                vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-subtitle" }), "JSON 驱动 · 可扩展")
              ]),
              vue.createElementVNode("scroll-view", new UTSJSONObject({
                class: "mcp-list",
                "scroll-y": ""
              }), [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(mcpServers), (srv = null, idx) => {
                  return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                    key: srv.name,
                    class: "mcp-server-item"
                  }), [
                    vue.createElementVNode("view", new UTSJSONObject({ class: "mcp-server-row" }), [
                      vue.createElementVNode("view", new UTSJSONObject({
                        class: vue.normalizeClass(["mcp-dot-status", new UTSJSONObject({ connected: srv.connected && srv.enabled })])
                      }), null, 2),
                      vue.createElementVNode("view", new UTSJSONObject({ class: "mcp-server-info" }), [
                        vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-server-name" }), vue.toDisplayString(srv.name), 1),
                        vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-server-cmd" }), vue.toDisplayString(srv.command) + " " + vue.toDisplayString((srv.args || []).join(" ")), 1)
                      ]),
                      vue.createElementVNode("view", new UTSJSONObject({
                        class: vue.normalizeClass(["mcp-toggle-switch", new UTSJSONObject({ on: srv.enabled })]),
                        onClick: ($event = null) => {
                          return toggleServer(idx);
                        }
                      }), [
                        vue.createElementVNode("view", new UTSJSONObject({ class: "toggle-knob" }))
                      ], 10, ["onClick"])
                    ]),
                    vue.createElementVNode("view", new UTSJSONObject({ class: "mcp-cwd-row" }), [
                      vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-cwd-label" }), "工作目录"),
                      vue.createElementVNode("input", new UTSJSONObject({
                        class: "mcp-cwd-input",
                        value: srv.cwd || ".",
                        onChange: ($event = null) => {
                          return updateCwd(idx, $event.target.value);
                        },
                        placeholder: "."
                      }), null, 40, ["value", "onChange"])
                    ]),
                    srv.enabled && srv.connected && getToolCount(srv) > 0 ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                      key: 0,
                      class: "mcp-tools"
                    }), [
                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(srv.tools, (enabled = null, toolName) => {
                        return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                          key: toolName,
                          class: "mcp-tool-item",
                          onClick: ($event = null) => {
                            return toggleTool(idx, toolName, !enabled);
                          }
                        }), [
                          vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-tool-check" }), vue.toDisplayString(enabled ? "☑" : "☐"), 1),
                          vue.createElementVNode("text", new UTSJSONObject({
                            class: vue.normalizeClass(["mcp-tool-name", new UTSJSONObject({ disabled: !enabled })])
                          }), vue.toDisplayString(toolName), 3)
                        ], 8, ["onClick"]);
                      }), 128))
                    ])) : vue.createCommentVNode("", true)
                  ]);
                }), 128)),
                vue.unref(mcpServers).length === 0 ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                  key: 0,
                  class: "mcp-empty"
                }), [
                  vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-empty-text" }), "暂无 MCP 服务器"),
                  vue.createElementVNode("text", new UTSJSONObject({ class: "mcp-empty-sub" }), "编辑 mcp_config.json 添加")
                ])) : vue.createCommentVNode("", true)
              ])
            ])) : vue.createCommentVNode("", true),
            vue.createElementVNode("scroll-view", new UTSJSONObject({
              class: "chat-scroll",
              "scroll-y": "",
              "scroll-top": vue.unref(scrollTop),
              "scroll-with-animation": ""
            }), [
              vue.unref(messageList).length === 0 ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                key: 0,
                class: "welcome-screen"
              }), [
                vue.createElementVNode("view", new UTSJSONObject({ class: "logo-wrap" }), [
                  vue.createElementVNode("view", new UTSJSONObject({ class: "ring ring-1" })),
                  vue.createElementVNode("view", new UTSJSONObject({ class: "ring ring-2" })),
                  vue.createElementVNode("view", new UTSJSONObject({ class: "ring ring-3" })),
                  vue.createElementVNode("view", new UTSJSONObject({ class: "logo-dot" }))
                ]),
                vue.createElementVNode("text", new UTSJSONObject({ class: "welcome-title" }), "有什么我可以帮你的？"),
                vue.createElementVNode("text", new UTSJSONObject({ class: "welcome-sub" }), "左侧查看历史会话 · MCP 面板开启工具"),
                vue.createElementVNode("view", new UTSJSONObject({ class: "suggestions" }), [
                  vue.createElementVNode("view", new UTSJSONObject({
                    class: "suggestion-btn",
                    onClick: _cache[0] || (_cache[0] = ($event = null) => {
                      return quickSend("帮我用Python写一个排序函数");
                    })
                  }), [
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-emoji" }), "💻"),
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-text" }), "写代码")
                  ]),
                  vue.createElementVNode("view", new UTSJSONObject({
                    class: "suggestion-btn",
                    onClick: _cache[1] || (_cache[1] = ($event = null) => {
                      return quickSend("用简单的语言解释什么是机器学习");
                    })
                  }), [
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-emoji" }), "🧠"),
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-text" }), "学知识")
                  ]),
                  vue.createElementVNode("view", new UTSJSONObject({
                    class: "suggestion-btn",
                    onClick: _cache[2] || (_cache[2] = ($event = null) => {
                      return quickSend("帮我总结一段文字的核心要点");
                    })
                  }), [
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-emoji" }), "📄"),
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-text" }), "总结内容")
                  ]),
                  vue.createElementVNode("view", new UTSJSONObject({
                    class: "suggestion-btn",
                    onClick: _cache[3] || (_cache[3] = ($event = null) => {
                      return quickSend("帮我头脑风暴一个新项目的想法");
                    })
                  }), [
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-emoji" }), "💡"),
                    vue.createElementVNode("text", new UTSJSONObject({ class: "sug-text" }), "头脑风暴")
                  ])
                ])
              ])) : vue.createCommentVNode("", true),
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(messageList), (msg, index) => {
                return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                  key: index,
                  id: "msg-" + index
                }), [
                  vue.createElementVNode("view", new UTSJSONObject({
                    class: vue.normalizeClass(["message", msg.role])
                  }), [
                    msg.role === "user" ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                      key: 0,
                      class: "avatar-user"
                    }), [
                      vue.createElementVNode("text", new UTSJSONObject({ class: "avatar-text" }), "我")
                    ])) : (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                      key: 1,
                      class: "avatar-ai"
                    }), [
                      vue.createElementVNode("text", new UTSJSONObject({ class: "avatar-text-ai" }), "AI")
                    ])),
                    vue.createElementVNode("view", new UTSJSONObject({ class: "msg-content" }), [
                      vue.createElementVNode("view", new UTSJSONObject({
                        class: vue.normalizeClass(["msg-bubble", msg.role === "user" ? "bubble-user" : "bubble-ai"])
                      }), [
                        (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(msg.blocks, (block, bi) => {
                          return vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({ key: bi }), [
                            block.type === "code" ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                              key: 0,
                              class: "code-block"
                            }), [
                              block.lang ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
                                key: 0,
                                class: "code-header"
                              }), [
                                vue.createElementVNode("text", new UTSJSONObject({ class: "code-lang" }), vue.toDisplayString(block.lang), 1)
                              ])) : vue.createCommentVNode("", true),
                              vue.createElementVNode("text", new UTSJSONObject({ class: "code-text" }), vue.toDisplayString(block.text), 1)
                            ])) : (vue.openBlock(), vue.createElementBlock("text", new UTSJSONObject({
                              key: 1,
                              class: vue.normalizeClass(["plain-text", msg.role === "user" ? "text-white" : "text-dark"])
                            }), vue.toDisplayString(block.text), 3))
                          ]);
                        }), 128))
                      ], 2),
                      vue.createElementVNode("text", new UTSJSONObject({ class: "msg-time" }), vue.toDisplayString(msg.time), 1)
                    ])
                  ], 2)
                ], 8, ["id"]);
              }), 128))
            ], 8, ["scroll-top"])
          ]),
          vue.createElementVNode("view", new UTSJSONObject({
            class: "input-wrapper",
            style: vue.normalizeStyle({ paddingBottom: vue.unref(keyboardBottom) + "px" })
          }), [
            vue.unref(showSkillDropdown) ? (vue.openBlock(), vue.createElementBlock("view", new UTSJSONObject({
              key: 0,
              class: "skill-dropdown-menu"
            }), [
              vue.createElementVNode("view", new UTSJSONObject({
                class: "skill-option",
                onClick: _cache[4] || (_cache[4] = ($event = null) => {
                  return useSkill("使用技能：系统健康检查");
                })
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "skill-option-icon" }), "🩺"),
                vue.createElementVNode("view", new UTSJSONObject({ class: "skill-option-info" }), [
                  vue.createElementVNode("text", new UTSJSONObject({ class: "skill-option-name" }), "系统健康检查"),
                  vue.createElementVNode("text", new UTSJSONObject({ class: "skill-option-desc" }), "检查服务器状态、CPU、内存、磁盘")
                ])
              ]),
              vue.createElementVNode("view", new UTSJSONObject({
                class: "skill-option",
                onClick: _cache[5] || (_cache[5] = ($event = null) => {
                  return useSkill("使用技能：脚本编写助手");
                })
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "skill-option-icon" }), "📝"),
                vue.createElementVNode("view", new UTSJSONObject({ class: "skill-option-info" }), [
                  vue.createElementVNode("text", new UTSJSONObject({ class: "skill-option-name" }), "脚本编写助手"),
                  vue.createElementVNode("text", new UTSJSONObject({ class: "skill-option-desc" }), "帮助编写各种运维脚本")
                ])
              ])
            ])) : vue.createCommentVNode("", true),
            vue.createElementVNode("view", new UTSJSONObject({ class: "skill-bar" }), [
              vue.createElementVNode("view", new UTSJSONObject({
                class: "skill-btn",
                onClick: toggleSkillDropdown
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "skill-emoji" }), "🛠️"),
                vue.createElementVNode("text", new UTSJSONObject({ class: "skill-label" }), "使用技能"),
                vue.createElementVNode("text", new UTSJSONObject({
                  class: vue.normalizeClass(["skill-arrow", new UTSJSONObject({ open: vue.unref(showSkillDropdown) })])
                }), "▼", 2)
              ]),
              vue.createElementVNode("view", new UTSJSONObject({
                class: "skill-btn",
                onClick: summarizeToKnowledge
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "skill-emoji" }), "📚"),
                vue.createElementVNode("text", new UTSJSONObject({ class: "skill-label" }), "知识库总结")
              ])
            ]),
            vue.createElementVNode("view", new UTSJSONObject({ class: "input-container" }), [
              vue.withDirectives(vue.createElementVNode("input", new UTSJSONObject({
                class: "input-box",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event = null) => {
                  return vue.isRef(inputText) ? inputText.value = $event : null;
                }),
                placeholder: "输入你的消息...",
                "placeholder-class": "input-placeholder",
                "confirm-type": "send",
                "adjust-position": "false",
                onConfirm: handleSend
              }), null, 544), [
                [vue.vModelText, vue.unref(inputText)]
              ]),
              vue.createElementVNode("view", new UTSJSONObject({
                class: vue.normalizeClass(["send-btn", new UTSJSONObject({ active: vue.unref(inputText).trim() !== "" })]),
                onClick: handleSend
              }), [
                vue.createElementVNode("text", new UTSJSONObject({ class: "send-arrow" }), "➤")
              ], 2)
            ]),
            vue.createElementVNode("text", new UTSJSONObject({ class: "input-hint" }), "Enter 发送 · Shift+Enter 换行")
          ], 4)
        ]);
      };
    }
  });
  const _style_0$1 = { "chat-page": { "": { "display": "flex", "flexDirection": "column", "width": "750rpx", "height": "100%", "backgroundColor": "#1a1d28" } }, "header": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "space-between", "width": "750rpx", "paddingTop": "24rpx", "paddingRight": "32rpx", "paddingBottom": "24rpx", "paddingLeft": "32rpx", "backgroundColor": "#22263a", "borderBottomWidth": "2rpx", "borderBottomStyle": "solid", "borderBottomColor": "#33384d" } }, "header-left": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center" } }, "brand-icon": { "": { "width": "64rpx", "height": "64rpx", "borderTopLeftRadius": "16rpx", "borderTopRightRadius": "16rpx", "borderBottomRightRadius": "16rpx", "borderBottomLeftRadius": "16rpx", "backgroundImage": "linear-gradient(135deg, #6366f1, #8b5cf6)", "backgroundColor": "rgba(0,0,0,0)", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center" } }, "brand-text": { "": { "color": "#ffffff", "fontSize": "28rpx", "fontWeight": "700" } }, "brand-name": { "": { "fontSize": "34rpx", "fontWeight": "600", "color": "#e8eaed", "marginLeft": "24rpx" } }, "header-right": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center" } }, "mcp-toggle": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "backgroundColor": "#2a2e42", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#383d54", "borderRightColor": "#383d54", "borderBottomColor": "#383d54", "borderLeftColor": "#383d54", "borderTopLeftRadius": "40rpx", "borderTopRightRadius": "40rpx", "borderBottomRightRadius": "40rpx", "borderBottomLeftRadius": "40rpx", "paddingTop": "16rpx", "paddingRight": "32rpx", "paddingBottom": "16rpx", "paddingLeft": "32rpx" }, ".active": { "borderTopColor": "#818cf8", "borderRightColor": "#818cf8", "borderBottomColor": "#818cf8", "borderLeftColor": "#818cf8" } }, "mcp-dot": { "": { "fontSize": "28rpx", "marginRight": "12rpx" } }, "mcp-label": { "": { "color": "#9ca3b8", "fontSize": "28rpx" }, ".mcp-toggle.active ": { "color": "#818cf8" } }, "tool-count": { "": { "color": "#ffffff", "backgroundColor": "#10b981", "borderTopLeftRadius": "20rpx", "borderTopRightRadius": "20rpx", "borderBottomRightRadius": "20rpx", "borderBottomLeftRadius": "20rpx", "paddingTop": "4rpx", "paddingRight": "16rpx", "paddingBottom": "4rpx", "paddingLeft": "16rpx", "fontSize": "22rpx", "fontWeight": "700" } }, "sidebar-toggle": { "": { "width": "64rpx", "height": "64rpx", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "marginLeft": "20rpx" } }, "menu-icon": { "": { "fontSize": "40rpx", "color": "#9ca3b8" } }, "content-area": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "display": "flex", "flexDirection": "column", "width": "750rpx", "minHeight": 0, "overflow": "hidden", "position": "relative" } }, "sidebar-overlay": { "": { "position": "absolute", "top": 0, "left": 0, "width": "750rpx", "height": "100%", "backgroundColor": "rgba(0,0,0,0.5)", "zIndex": 90 } }, "sidebar": { "": { "position": "absolute", "top": 0, "left": "-560rpx", "width": "560rpx", "height": "100%", "backgroundColor": "#1c1f30", "borderRightWidth": "2rpx", "borderRightStyle": "solid", "borderRightColor": "#33384d", "zIndex": 100, "display": "flex", "flexDirection": "column", "transitionProperty": "left", "transitionDuration": "0.3s" }, ".open": { "left": 0 } }, "sidebar-header": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "space-between", "paddingTop": "32rpx", "paddingRight": "32rpx", "paddingBottom": "32rpx", "paddingLeft": "32rpx", "borderBottomWidth": "2rpx", "borderBottomStyle": "solid", "borderBottomColor": "#33384d" } }, "sidebar-title": { "": { "fontSize": "28rpx", "fontWeight": "600", "color": "#e8eaed" } }, "new-chat-btn": { "": { "width": "64rpx", "height": "64rpx", "borderTopLeftRadius": "16rpx", "borderTopRightRadius": "16rpx", "borderBottomRightRadius": "16rpx", "borderBottomLeftRadius": "16rpx", "backgroundColor": "#6366f1", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center" } }, "new-chat-icon": { "": { "fontSize": "36rpx", "color": "#ffffff" } }, "sidebar-list": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "paddingTop": "16rpx", "paddingRight": "16rpx", "paddingBottom": "16rpx", "paddingLeft": "16rpx" } }, "session-item": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "paddingTop": "20rpx", "paddingRight": "24rpx", "paddingBottom": "20rpx", "paddingLeft": "24rpx", "marginBottom": "4rpx", "borderTopLeftRadius": "16rpx", "borderTopRightRadius": "16rpx", "borderBottomRightRadius": "16rpx", "borderBottomLeftRadius": "16rpx" }, ".active": { "backgroundColor": "rgba(99,102,241,0.15)", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "rgba(99,102,241,0.3)", "borderRightColor": "rgba(99,102,241,0.3)", "borderBottomColor": "rgba(99,102,241,0.3)", "borderLeftColor": "rgba(99,102,241,0.3)" } }, "session-info": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "minWidth": 0 } }, "session-title": { "": { "fontSize": "26rpx", "color": "#e8eaed", "fontWeight": "500", "marginBottom": "4rpx", "textOverflow": "ellipsis", "whiteSpace": "nowrap", "overflow": "hidden" } }, "session-time": { "": { "fontSize": "22rpx", "color": "#7a80a0" } }, "session-delete": { "": { "width": "48rpx", "height": "48rpx", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "flexShrink": 0 } }, "delete-icon": { "": { "fontSize": "32rpx" } }, "sidebar-empty": { "": { "paddingTop": "80rpx", "paddingRight": "32rpx", "paddingBottom": "80rpx", "paddingLeft": "32rpx", "textAlign": "center" } }, "empty-text": { "": { "fontSize": "26rpx", "color": "#7a80a0" } }, "mcp-panel": { "": { "position": "absolute", "top": 0, "left": 0, "width": "560rpx", "height": "100%", "backgroundColor": "#22263a", "borderRightWidth": "2rpx", "borderRightStyle": "solid", "borderRightColor": "#33384d", "zIndex": 80, "display": "flex", "flexDirection": "column" } }, "mcp-header": { "": { "paddingTop": "24rpx", "paddingRight": "32rpx", "paddingBottom": "16rpx", "paddingLeft": "32rpx", "borderBottomWidth": "2rpx", "borderBottomStyle": "solid", "borderBottomColor": "#33384d" } }, "mcp-title": { "": { "fontSize": "28rpx", "fontWeight": "600", "color": "#e8eaed", "marginBottom": "6rpx" } }, "mcp-subtitle": { "": { "fontSize": "24rpx", "color": "#9ca3b8" } }, "mcp-list": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "paddingTop": "16rpx", "paddingRight": "16rpx", "paddingBottom": "16rpx", "paddingLeft": "16rpx" } }, "mcp-server-item": { "": { "backgroundColor": "#2a2e42", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#383d54", "borderRightColor": "#383d54", "borderBottomColor": "#383d54", "borderLeftColor": "#383d54", "borderTopLeftRadius": "24rpx", "borderTopRightRadius": "24rpx", "borderBottomRightRadius": "24rpx", "borderBottomLeftRadius": "24rpx", "paddingTop": "24rpx", "paddingRight": "24rpx", "paddingBottom": "24rpx", "paddingLeft": "24rpx", "marginBottom": "16rpx" } }, "mcp-server-row": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center" } }, "mcp-dot-status": { "": { "width": "16rpx", "height": "16rpx", "borderTopLeftRadius": "8rpx", "borderTopRightRadius": "8rpx", "borderBottomRightRadius": "8rpx", "borderBottomLeftRadius": "8rpx", "backgroundColor": "#7a80a0", "flexShrink": 0, "marginRight": "16rpx" }, ".connected": { "backgroundColor": "#10b981" } }, "mcp-server-info": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "minWidth": 0 } }, "mcp-server-name": { "": { "fontSize": "26rpx", "fontWeight": "600", "color": "#e8eaed", "marginBottom": "4rpx" } }, "mcp-server-cmd": { "": { "fontSize": "22rpx", "color": "#9ca3b8", "textOverflow": "ellipsis", "overflow": "hidden", "whiteSpace": "nowrap" } }, "mcp-toggle-switch": { "": { "width": "80rpx", "height": "44rpx", "borderTopLeftRadius": "22rpx", "borderTopRightRadius": "22rpx", "borderBottomRightRadius": "22rpx", "borderBottomLeftRadius": "22rpx", "backgroundColor": "#383d54", "position": "relative", "flexShrink": 0 }, ".on": { "backgroundColor": "#6366f1" } }, "toggle-knob": { "": { "width": "36rpx", "height": "36rpx", "borderTopLeftRadius": "18rpx", "borderTopRightRadius": "18rpx", "borderBottomRightRadius": "18rpx", "borderBottomLeftRadius": "18rpx", "backgroundColor": "#ffffff", "position": "absolute", "top": "4rpx", "left": "4rpx", "transitionProperty": "left", "transitionDuration": "0.2s" }, ".mcp-toggle-switch.on ": { "left": "40rpx" } }, "mcp-cwd-row": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "marginTop": "16rpx", "paddingTop": "16rpx", "borderTopWidth": "2rpx", "borderTopStyle": "solid", "borderTopColor": "#2a2e38" } }, "mcp-cwd-label": { "": { "fontSize": "22rpx", "color": "#8b8fa3", "flexShrink": 0, "marginRight": "12rpx" } }, "mcp-cwd-input": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "height": "56rpx", "backgroundColor": "#0f1117", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#2a2e38", "borderRightColor": "#2a2e38", "borderBottomColor": "#2a2e38", "borderLeftColor": "#2a2e38", "borderTopLeftRadius": "12rpx", "borderTopRightRadius": "12rpx", "borderBottomRightRadius": "12rpx", "borderBottomLeftRadius": "12rpx", "color": "#e4e6eb", "fontSize": "22rpx", "paddingLeft": "16rpx" } }, "mcp-tools": { "": { "marginTop": "16rpx", "paddingTop": "12rpx", "borderTopWidth": "2rpx", "borderTopStyle": "solid", "borderTopColor": "#2a2e38", "display": "flex", "flexDirection": "column" } }, "mcp-tool-item": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "paddingTop": "12rpx", "paddingRight": "16rpx", "paddingBottom": "12rpx", "paddingLeft": "16rpx", "borderTopLeftRadius": "12rpx", "borderTopRightRadius": "12rpx", "borderBottomRightRadius": "12rpx", "borderBottomLeftRadius": "12rpx", "marginBottom": "8rpx" } }, "mcp-tool-check": { "": { "fontSize": "32rpx", "marginRight": "12rpx" } }, "mcp-tool-name": { "": { "fontSize": "24rpx", "color": "#e4e6eb" }, ".disabled": { "color": "#6b6f82" } }, "mcp-empty": { "": { "paddingTop": "80rpx", "paddingRight": "32rpx", "paddingBottom": "80rpx", "paddingLeft": "32rpx", "textAlign": "center" } }, "mcp-empty-text": { "": { "fontSize": "26rpx", "color": "#6b6f82" } }, "mcp-empty-sub": { "": { "fontSize": "22rpx", "color": "#6b6f82", "marginTop": "8rpx" } }, "chat-scroll": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "width": "750rpx", "paddingBottom": "200rpx" } }, "welcome-screen": { "": { "display": "flex", "flexDirection": "column", "alignItems": "center", "width": "750rpx", "paddingTop": "60rpx", "paddingBottom": "40rpx" } }, "logo-wrap": { "": { "width": "260rpx", "height": "260rpx", "position": "relative", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "marginBottom": "60rpx" } }, "ring": { "": { "position": "absolute", "borderTopLeftRadius": "130rpx", "borderTopRightRadius": "130rpx", "borderBottomRightRadius": "130rpx", "borderBottomLeftRadius": "130rpx", "borderTopWidth": "4rpx", "borderRightWidth": "4rpx", "borderBottomWidth": "4rpx", "borderLeftWidth": "4rpx", "borderTopStyle": "dashed", "borderRightStyle": "dashed", "borderBottomStyle": "dashed", "borderLeftStyle": "dashed", "borderTopColor": "#3b82f6", "borderRightColor": "#3b82f6", "borderBottomColor": "#3b82f6", "borderLeftColor": "#3b82f6" } }, "ring-1": { "": { "width": "260rpx", "height": "260rpx" } }, "ring-2": { "": { "width": "200rpx", "height": "200rpx" } }, "ring-3": { "": { "width": "140rpx", "height": "140rpx" } }, "logo-dot": { "": { "width": "60rpx", "height": "60rpx", "borderTopLeftRadius": "30rpx", "borderTopRightRadius": "30rpx", "borderBottomRightRadius": "30rpx", "borderBottomLeftRadius": "30rpx", "backgroundColor": "#3b82f6" } }, "welcome-title": { "": { "fontSize": "56rpx", "fontWeight": "700", "color": "#ffffff", "marginBottom": "16rpx" } }, "welcome-sub": { "": { "fontSize": "28rpx", "color": "#9ca3b8", "marginBottom": "60rpx" } }, "suggestions": { "": { "display": "flex", "flexWrap": "wrap", "flexDirection": "row", "width": "640rpx", "justifyContent": "space-between", "marginBottom": "20rpx" } }, "suggestion-btn": { "": { "width": "310rpx", "height": "120rpx", "backgroundColor": "#22263a", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#33384d", "borderRightColor": "#33384d", "borderBottomColor": "#33384d", "borderLeftColor": "#33384d", "borderTopLeftRadius": "24rpx", "borderTopRightRadius": "24rpx", "borderBottomRightRadius": "24rpx", "borderBottomLeftRadius": "24rpx", "display": "flex", "flexDirection": "row", "alignItems": "center", "paddingLeft": "28rpx", "paddingRight": "28rpx", "marginBottom": "16rpx" } }, "sug-emoji": { "": { "fontSize": "44rpx", "marginRight": "20rpx" } }, "sug-text": { "": { "fontSize": "30rpx", "color": "#e8eaed" } }, "message": { "": { "display": "flex", "flexDirection": "row", "paddingTop": "28rpx", "paddingLeft": "32rpx", "paddingRight": "32rpx", "width": "750rpx" }, ".user": { "flexDirection": "row-reverse" } }, "avatar-user": { "": { "width": "80rpx", "height": "80rpx", "borderTopLeftRadius": "40rpx", "borderTopRightRadius": "40rpx", "borderBottomRightRadius": "40rpx", "borderBottomLeftRadius": "40rpx", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "flexShrink": 0, "backgroundImage": "linear-gradient(135deg, #6366f1, #8b5cf6)", "backgroundColor": "rgba(0,0,0,0)", "marginRight": "24rpx" } }, "avatar-ai": { "": { "width": "80rpx", "height": "80rpx", "borderTopLeftRadius": "40rpx", "borderTopRightRadius": "40rpx", "borderBottomRightRadius": "40rpx", "borderBottomLeftRadius": "40rpx", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "flexShrink": 0, "backgroundColor": "#f3f4f6", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#d1d5db", "borderRightColor": "#d1d5db", "borderBottomColor": "#d1d5db", "borderLeftColor": "#d1d5db", "marginRight": "24rpx" } }, "avatar-text": { "": { "color": "#ffffff", "fontSize": "28rpx", "fontWeight": "500" } }, "avatar-text-ai": { "": { "color": "#6366f1", "fontSize": "28rpx", "fontWeight": "500" } }, "msg-content": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%" } }, "msg-bubble": { "": { "borderTopLeftRadius": "32rpx", "borderTopRightRadius": "32rpx", "borderBottomRightRadius": "32rpx", "borderBottomLeftRadius": "32rpx", "paddingTop": "28rpx", "paddingRight": "36rpx", "paddingBottom": "28rpx", "paddingLeft": "36rpx" } }, "bubble-user": { "": { "backgroundImage": "linear-gradient(135deg, #6366f1, #8b5cf6)", "backgroundColor": "rgba(0,0,0,0)", "borderBottomRightRadius": "8rpx" } }, "bubble-ai": { "": { "backgroundColor": "#ffffff", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#d1d5db", "borderRightColor": "#d1d5db", "borderBottomColor": "#d1d5db", "borderLeftColor": "#d1d5db", "borderBottomLeftRadius": "8rpx" } }, "plain-text": { "": { "fontSize": "30rpx", "lineHeight": 1.6 } }, "text-dark": { "": { "color": "#1f2937" } }, "text-white": { "": { "color": "#ffffff" } }, "code-block": { "": { "backgroundColor": "#0f1117", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#3b3f54", "borderRightColor": "#3b3f54", "borderBottomColor": "#3b3f54", "borderLeftColor": "#3b3f54", "borderTopLeftRadius": "16rpx", "borderTopRightRadius": "16rpx", "borderBottomRightRadius": "16rpx", "borderBottomLeftRadius": "16rpx", "marginTop": "16rpx", "marginRight": 0, "marginBottom": "16rpx", "marginLeft": 0, "paddingTop": "4rpx", "paddingRight": 0, "paddingBottom": 0, "paddingLeft": 0, "overflow": "hidden" } }, "code-header": { "": { "paddingTop": "12rpx", "paddingRight": "24rpx", "paddingBottom": "12rpx", "paddingLeft": "24rpx", "borderBottomWidth": "2rpx", "borderBottomStyle": "solid", "borderBottomColor": "#3b3f54", "backgroundColor": "#1a1d28" } }, "code-lang": { "": { "fontSize": "22rpx", "color": "#6b6f82" } }, "code-text": { "": { "fontSize": "26rpx", "lineHeight": 1.7, "color": "#d4d4d8", "paddingTop": "20rpx", "paddingRight": "24rpx", "paddingBottom": "20rpx", "paddingLeft": "24rpx" } }, "msg-time": { "": { "fontSize": "24rpx", "color": "#9ca3b8", "marginTop": "12rpx", "paddingLeft": "8rpx" } }, "skill-bar": { "": { "display": "flex", "flexDirection": "row", "paddingTop": "4rpx", "paddingRight": 0, "paddingBottom": "16rpx", "paddingLeft": 0 } }, "skill-btn": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "backgroundColor": "#22263a", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#33384d", "borderRightColor": "#33384d", "borderBottomColor": "#33384d", "borderLeftColor": "#33384d", "borderTopLeftRadius": "20rpx", "borderTopRightRadius": "20rpx", "borderBottomRightRadius": "20rpx", "borderBottomLeftRadius": "20rpx", "paddingTop": "16rpx", "paddingRight": "28rpx", "paddingBottom": "16rpx", "paddingLeft": "28rpx", "marginRight": "16rpx" } }, "skill-emoji": { "": { "fontSize": "28rpx", "marginRight": "12rpx" } }, "skill-label": { "": { "fontSize": "26rpx", "color": "#9ca3b8" } }, "skill-arrow": { "": { "fontSize": "24rpx", "color": "#9ca3b8", "marginLeft": "4rpx", "transitionProperty": "transform", "transitionDuration": "0.2s" }, ".open": { "transform": "rotate(180deg)" } }, "skill-dropdown-menu": { "": { "width": "686rpx", "backgroundColor": "#2a2e42", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#383d54", "borderRightColor": "#383d54", "borderBottomColor": "#383d54", "borderLeftColor": "#383d54", "borderTopLeftRadius": "24rpx", "borderTopRightRadius": "24rpx", "borderBottomRightRadius": "24rpx", "borderBottomLeftRadius": "24rpx", "paddingTop": "12rpx", "paddingRight": "12rpx", "paddingBottom": "12rpx", "paddingLeft": "12rpx", "marginBottom": "12rpx" } }, "skill-option": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "paddingTop": "20rpx", "paddingRight": "24rpx", "paddingBottom": "20rpx", "paddingLeft": "24rpx", "borderTopLeftRadius": "16rpx", "borderTopRightRadius": "16rpx", "borderBottomRightRadius": "16rpx", "borderBottomLeftRadius": "16rpx" } }, "skill-option-icon": { "": { "fontSize": "40rpx", "width": "64rpx", "height": "64rpx", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "backgroundColor": "#22263a", "borderTopLeftRadius": "16rpx", "borderTopRightRadius": "16rpx", "borderBottomRightRadius": "16rpx", "borderBottomLeftRadius": "16rpx", "flexShrink": 0, "marginRight": "20rpx" } }, "skill-option-info": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "minWidth": 0 } }, "skill-option-name": { "": { "fontSize": "28rpx", "fontWeight": "600", "color": "#e8eaed", "marginBottom": "4rpx" } }, "skill-option-desc": { "": { "fontSize": "22rpx", "color": "#9ca3b8", "textOverflow": "ellipsis", "overflow": "hidden", "whiteSpace": "nowrap" } }, "input-wrapper": { "": { "width": "750rpx", "backgroundColor": "#1a1d28", "paddingTop": "8rpx", "paddingRight": "32rpx", "paddingBottom": "32rpx", "paddingLeft": "32rpx" } }, "input-container": { "": { "display": "flex", "flexDirection": "row", "alignItems": "center", "backgroundColor": "#22263a", "borderTopWidth": "2rpx", "borderRightWidth": "2rpx", "borderBottomWidth": "2rpx", "borderLeftWidth": "2rpx", "borderTopStyle": "solid", "borderRightStyle": "solid", "borderBottomStyle": "solid", "borderLeftStyle": "solid", "borderTopColor": "#33384d", "borderRightColor": "#33384d", "borderBottomColor": "#33384d", "borderLeftColor": "#33384d", "borderTopLeftRadius": "32rpx", "borderTopRightRadius": "32rpx", "borderBottomRightRadius": "32rpx", "borderBottomLeftRadius": "32rpx", "paddingTop": "12rpx", "paddingRight": "16rpx", "paddingBottom": "12rpx", "paddingLeft": "16rpx" } }, "input-box": { "": { "flexGrow": 1, "flexShrink": 1, "flexBasis": "0%", "height": "80rpx", "fontSize": "30rpx", "color": "#e8eaed", "paddingLeft": "20rpx" } }, "input-placeholder": { "": { "color": "#9ca3b8" } }, "send-btn": { "": { "width": "80rpx", "height": "80rpx", "borderTopLeftRadius": "20rpx", "borderTopRightRadius": "20rpx", "borderBottomRightRadius": "20rpx", "borderBottomLeftRadius": "20rpx", "backgroundColor": "#383d54", "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "flexShrink": 0 }, ".active": { "backgroundImage": "linear-gradient(135deg, #6366f1, #8b5cf6)", "backgroundColor": "rgba(0,0,0,0)" } }, "send-arrow": { "": { "fontSize": "36rpx", "color": "#ffffff" } }, "input-hint": { "": { "fontSize": "24rpx", "color": "#9ca3b8", "marginTop": "16rpx", "textAlign": "center", "width": "686rpx" } }, "@TRANSITION": { "sidebar": { "property": "left", "duration": "0.3s" }, "toggle-knob": { "property": "left", "duration": "0.2s" }, "skill-arrow": { "property": "transform", "duration": "0.2s" } } };
  const PagesAiChatAiChat = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["styles", [_style_0$1]]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/ai-chat/ai-chat", PagesAiChatAiChat);
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "App",
    setup(__props) {
      vue.onLaunch(() => {
        uni.__log__("log", "at App.uvue:7", "App Launch");
      });
      vue.onAppShow(() => {
        uni.__log__("log", "at App.uvue:11", "App Show");
      });
      vue.onAppHide(() => {
        uni.__log__("log", "at App.uvue:15", "App Hide");
      });
      return () => {
      };
    }
  });
  const _style_0 = { "uni-row": { "": { "flexDirection": "row" } }, "uni-column": { "": { "flexDirection": "column" } } };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["styles", [_style_0]]]);
  const __global__ = typeof globalThis === "undefined" ? Function("return this")() : globalThis;
  __global__.__uniX = true;
  function createApp() {
    const app = vue.createSSRApp(App);
    return {
      app
    };
  }
  createApp().app.mount("#app");
})(Vue);
