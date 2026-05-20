// @ts-nocheck

import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import VueDevtools from 'vite-plugin-vue-devtools';
import MetaLayouts from 'vite-plugin-vue-meta-layouts';
import a from 'vitest';
import u from 'unplugin-a';
import Components from 'unplugin-vue-components/vite';
import VueRouter from 'vue-router/vite';
import Unocss from 'unocss/vite';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
