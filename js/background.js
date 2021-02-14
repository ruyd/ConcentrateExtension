"use strict";
import TabModel from "./common.js";

const Tabs = new Map();
const Context = {};
const log = console.log.bind(window.console);

function init() {
  chrome.storage.sync.get("Settings", function (data) {
    Context.Settings = data.Settings;
    tabify();
  });
}

function tabify() {
  Tabs.clear();
  return chrome.tabs.query({}, (list) => {
    for (let item of list) {
      log(item);
      if (item) setModel(item);
    }
  });
}
function setModel(item) {
  const model = new TabModel(item, Context.Settings);
  Tabs.set(item.id, model);
}

function onChange(e) {
  const item = e;
  log(e);
  //setModel(item);
}

// Listeners

chrome.tabs.onCreated.addListener(onChange);

chrome.tabs.onRemoved.addListener(onChange);

chrome.tabs.onActiveChanged.addListener(function (ot) {});

chrome.runtime.onConnect.addListener(onConnect);

function onConnect(port) {
  log(port);
  port.onMessage.addListener(onMessageHandler);
  port.onDisconnect.addListener(() => {});
}

function onMessageHandler(message, port) {
  const action = message && message.type;
  const model = port ? Tabs.get(port.sender.tab.id) : null;
  if (!model) {
    log("tab n/a", message, port);
  }
  switch (action) {
    case "connected":
      if (port) port.postMessage({ type: "model", payload: model });
      break;
    default:
      break;
  }
}

function onNavigate() {}
/////

init();