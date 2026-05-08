"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n";

/**
 * 根据当前 i18n locale 动态设置 <html lang> 属性。
 * 该组件不渲染任何 UI，仅产生副作用。
 */
export function HtmlLangSetter() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
