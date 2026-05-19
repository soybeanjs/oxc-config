// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { down } from "tsdown";
import { createApp } from "vue";
import type { ComputedRef } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { buttonVariants2 } from "@soybeanjs/headless";
import { buttonVariants } from "@soybeanjs/ui";
import type { ButtonProps } from "@soybeanjs/ui";
import axios from "axios";
import type { AxiosInstance } from "axios";
import { isEmpty } from "lodash";
import { debounce } from "lodash-es";
import "uno.css";
import { ROUTES } from "@/constants/routes";
import { a } from "@/shared";
import { b } from "@/plugin";
import { useAuth } from "@/composables/useAuth";
import { bar } from "../../bar";
import { foo } from "../foo";
import { helper } from "./shared";
import type { HelperType } from "./utils";
