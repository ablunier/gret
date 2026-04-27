import React from "react";
import { render } from "ink";
import { App } from "./ui/App.js";
import { loadConfig } from "./config/config.js";

const config = loadConfig();
render(React.createElement(App, { config }));
