<template>
  <prime-dialog ref="dialog" modal maximizable v-model:visible="open">
    <template #header>
      <span class="flex items-end gap-4">
        <input-text v-model="title" size="large"></input-text>
        <auto-complete
          v-model="language.name"
          :suggestions="filteredLanguages"
          dropdown
          option-label="name"
          @complete="searchLanguages"
          @blur="selectLanguage"
          @item-select="(e) => (language = e.value)"
        />
      </span>
    </template>
    <splitter class="h-full">
      <splitter-panel :size="50">
        <tab-view class="h-full flex flex-col" v-model:active-index="activeIndex">
          <tab-panel v-for="lang in Object.keys(code ?? {})" :header="lang">
            <vue-monaco-editor
              :language="lang"
              v-model:value="code[lang]"
              :options="{
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                theme: 'vs-dark'
              }"
            />
          </tab-panel>
        </tab-view>
      </splitter-panel>
      <splitter-panel v-show="language.isRunnable">
        <splitter layout="vertical" class="pt-14">
          <splitter-panel v-show="language.name === 'HTML/CSS/JS'">
            <div ref="iframeContainer" class="w-full h-full flex flex-col">
              <div class="w-full rounded-t h-8 flex gap-4 items-center px-4 bg-[var(--surface-ground)]">
                <div class="flex gap-2">
                  <div class="w-[0.65rem] h-[0.65rem] rounded-[50%] bg-red-500"></div>
                  <div class="w-[0.65rem] h-[0.65rem] rounded-[50%] bg-yellow-500"></div>
                  <div class="w-[0.65rem] h-[0.65rem] rounded-[50%] bg-green-500"></div>
                </div>
                <div
                  class="rounded-sm flex-1 h-5 flex justify-between items-center px-2 truncate border border-[var(--surface-border)] bg-[var(--surface-card)]"
                >
                  <span class="text-[0.65rem] text-gray-400 truncate">https://snipbit.dev/snippet</span>
                  <i class="pi pi-search text-xs"></i>
                </div>
                <i class="pi pi-bars text-xs"></i>
              </div>
              <iframe ref="iframe" class="w-full flex-1 bg-white"></iframe>
            </div>
          </splitter-panel>
          <splitter-panel>
            <terminal ref="terminal" />
          </splitter-panel>
        </splitter>
      </splitter-panel>
    </splitter>
    <template #footer>
      <prime-button @click="createSnippet">Create</prime-button>
    </template>
  </prime-dialog>
</template>

<script setup lang="ts">
import PrimeDialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import AutoComplete, { type AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import PrimeButton from 'primevue/button';
import Terminal from './Terminal.vue';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import { onMounted, ref, watch, nextTick } from 'vue';
import pb from '@/pocketbase';
import { useToast } from 'primevue/usetoast';
import { Collections, type LanguagesRecord, type LanguagesResponse, type SnippetsRecord } from '@/util/pocketbase-types';

const toast = useToast();
var tempConsole: Console = {} as Console;
const open = ref(false);

const dialog = ref({} as any);
const iframe = ref({} as HTMLIFrameElement);
const terminal = ref({} as InstanceType<typeof Terminal>);

const languages = ref([] as LanguagesRecord[]);
const filteredLanguages = ref([] as LanguagesRecord[]);
const language = ref({} as LanguagesRecord);
const code = ref();
const title = ref(`My Snippet`);
const activeIndex = ref(0);
const codeHandler = ref();

const searchLanguages = (event: AutoCompleteCompleteEvent) => {
  filteredLanguages.value = languages.value.filter((e) => e.name?.toLowerCase().includes(event.query.toLowerCase()));
};

const selectLanguage = () => {
  language.value = {
    ...(languages.value.find((e) => e.name?.toLowerCase() === language.value.name?.toLowerCase()) ?? {
      name: language.value.name,
      monacoName: language.value.name
    })
  };
};

const createSnippet = () => {
  pb.collection(Collections.Snippets)
    .create({
      title: title.value,
      content: language.value.name === 'HTML/CSS/JS' ? JSON.stringify(code.value) : code.value[Object.keys(code.value)[0]],
      user: pb.authStore.model?.id,
      language: (language.value as LanguagesResponse).id,
      customLanguage: (language.value as LanguagesResponse).id ? undefined : language.value.name,
      runnable: language.value.isRunnable ?? false
    } as SnippetsRecord)
    .then(() => (open.value = false))
    .catch(() => toast.add({ severity: 'error', summary: 'Error', detail: `There was a problem creating the snippet.`, life: 3000 }));
};

watch(
  language,
  (value) => {
    activeIndex.value = 0;
    code.value = value.monacoName?.split('/').reduce(
      (acc, current) => {
        acc[current] = '';
        return acc;
      },
      {} as { [key: string]: any }
    );
    codeHandler.value = setCodeHandler(value);
  },
  { deep: true }
);

watch(
  code,
  () => {
    codeHandler.value();
  },
  { deep: true }
);

const setCodeHandler = (lang: LanguagesRecord) => {
  console = tempConsole;
  switch (lang.name) {
    case 'HTML/CSS/JS':
      return handleHtmlCssJs;
    case 'JavaScript':
      console = {
        ...console,
        assert: terminal.value.assert,
        clear: terminal.value.clear,
        debug: terminal.value.debug,
        error: terminal.value.error,
        info: terminal.value.info,
        log: terminal.value.log,
        warn: terminal.value.warn
      };
      return handleJavaScript;
    default:
      return console.log;
  }
};

const handleJavaScript = () => {
  terminal.value.clear();
  try {
    terminal.value.log(eval(code.value['javascript']));
  } catch (e: any) {
    terminal.value.error(e.message);
  }
};

const handleHtmlCssJs = () => {
  terminal.value.clear();
  (iframe.value.contentWindow as Window).document.head.innerHTML = `<style>${code.value['css']}</style>`;
  (iframe.value.contentWindow as Window).document.body.innerHTML = code.value['html'];
  let script = document.createElement('script');
  script.textContent = code.value['javascript'];
  (iframe.value.contentWindow as Window).document.body.appendChild(script);
};

const initializeIframe = () => {
  (iframe.value.contentWindow as Window & { console: any }).console = {
    assert: terminal.value.assert,
    clear: terminal.value.clear,
    debug: terminal.value.debug,
    error: terminal.value.error,
    info: terminal.value.info,
    log: terminal.value.log,
    warn: terminal.value.warn
  };
  iframe.value.contentWindow?.addEventListener('error', (e) => {
    e.preventDefault();
    terminal.value.error(e.error);
  });
};

const initialize = () => {
  open.value = true;
  pb.collection('languages')
    .getFullList()
    .then((res) => {
      languages.value = res;
      language.value = { ...(res.find((e) => e.name === 'HTML/CSS/JS') ?? {}) };
    })
    .catch(() => toast.add({ severity: 'error', summary: 'Error', detail: `There was a problem fetching the languages.`, life: 3000 }));

  nextTick(initializeIframe);
  tempConsole = console;
};

defineExpose({ open: initialize });

onMounted(() => {
  dialog.value.maximize();
});
</script>

<style>
.p-dialog-header-maximize {
  display: none;
}

.p-tabview-panels {
  padding: 0;
  flex: 1;
}

.p-tabview-panel {
  height: 100%;
}

.monaco-editor {
  position: absolute !important;
}
</style>
