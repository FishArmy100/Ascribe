import { invoke } from "@tauri-apps/api/core";
import { OsisBook } from "./bible";
import { HtmlText } from "./html_text";

export interface ExternalModuleData {
    aliases: Record<string, string>;
    assets: Record<string, string>;
}

export type ReadingsFormat = |{
    type: "daily";
    count: number;
} |{
    type: "weekly";
    count: number;
} |{
    type: "yearly";
    count: number;
    leap_year: "skip" | number;
};

export interface BibleConfig {
  type: "bible_config";
  name: string;
  id: string;
  authors?: string[];
  language?: string;
  description?: HtmlText;
  data_source?: string;
  pub_year?: number;
  license?: string;
  books: Record<OsisBook, string>;
  book_abbreviations: Record<OsisBook, string>;
  book_aliases: Record<string, OsisBook>;
  external: ExternalModuleData;
}

export interface NotebookConfig {
  type: "notebook_config";
  name: string;
  id: string;
  authors?: string[];
  language?: string;
  description?: HtmlText;
  data_source?: string;
  pub_year?: number;
  bible?: string;
  external: ExternalModuleData;
}

export interface StrongsDefConfig {
  type: "strongs_def_config";
  name: string;
  id: string;
  authors?: string[];
  language?: string;
  description?: HtmlText;
  data_source?: string;
  pub_year?: number;
  license?: string;
  external: ExternalModuleData;
}

export interface StrongsLinksConfig {
  type: "strongs_links_config";
  name: string;
  id: string;
  short_name?: string;
  bible: string;
  authors?: string[];
  language?: string;
  description?: HtmlText;
  data_source?: string;
  pub_year?: number;
  license?: string;
  external: ExternalModuleData;
}

export interface CommentaryConfig {
  type: "commentary_config";
  name: string;
  id: string;
  short_name?: string;
  bible?: string;
  authors?: string[];
  language?: string;
  description?: HtmlText;
  data_source?: string;
  pub_year?: number;
  license?: string;
  external: ExternalModuleData;
}

export interface DictionaryConfig {
    type: "dictionary_config";
    name: string;
    id: string;
    short_name?: string;
    authors?: string[];
    language?: string;
    description?: HtmlText;
    data_source?: string;
    pub_year?: number;
    license?: string;
    external: ExternalModuleData;
}

export interface ReadingsConfig {
    type: "readings_config";
    name: string;
    id: string;
    short_name?: string;
    authors?: string[];
    description?: HtmlText;
    data_source?: string;
    pub_year?: number;
    license?: string;
    language?: string;
    format: ReadingsFormat;
    external: ExternalModuleData;
}

export interface XRefConfig {
    type: "x_ref_config";
    name: string;
    id: string;
    short_name?: string;
    authors?: string[];
    language?: string;
    description?: HtmlText;
    data_source?: string;
    pub_year?: number;
    license?: string;
    bible?: string;
    external: ExternalModuleData;
}

export type ModuleConfig =
  | BibleConfig
  | NotebookConfig
  | StrongsDefConfig
  | StrongsLinksConfig
  | CommentaryConfig
  | DictionaryConfig
  | ReadingsConfig
  | XRefConfig;


export async function fetch_backend_module_configs(): Promise<ModuleConfig[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_module_configs"
        }
    }).then(v => {
        return JSON.parse(v);
    })
}