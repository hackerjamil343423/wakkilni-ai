"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ConnectAccountPromptProps {
  onConnect: () => void;
}

export function ConnectAccountPrompt({ onConnect }: ConnectAccountPromptProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">{t("googleAds.connect.title")}</CardTitle>
          <CardDescription className="text-base mt-2">
            {t("googleAds.connect.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t("googleAds.connect.benefits.title")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t("googleAds.connect.benefits.benefit1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t("googleAds.connect.benefits.benefit2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t("googleAds.connect.benefits.benefit3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t("googleAds.connect.benefits.benefit4")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t("googleAds.connect.benefits.benefit5")}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t("googleAds.connect.howItWorks.title")}</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  1
                </span>
                <span>{t("googleAds.connect.howItWorks.step1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  2
                </span>
                <span>{t("googleAds.connect.howItWorks.step2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  3
                </span>
                <span>{t("googleAds.connect.howItWorks.step3")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  4
                </span>
                <span>{t("googleAds.connect.howItWorks.step4")}</span>
              </li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              onClick={onConnect}
              size="lg"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("googleAds.connect.button")}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {t("googleAds.connect.disclaimer")}
            </p>
          </div>

          <div className="pt-4 border-t">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                {t("googleAds.connect.privacy.title")}
              </summary>
              <div className="text-muted-foreground space-y-2">
                <p>{t("googleAds.connect.privacy.description")}</p>
                <p>{t("googleAds.connect.privacy.disconnect")}</p>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
