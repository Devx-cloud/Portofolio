import { Suspense } from "react";
import { stages } from "@/data/stages";
import { LevelLayout } from "@/layouts/LevelLayout";
import { StageLoading } from "@/components/StageLoading";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const StagePage = ({ stageId }) => {
  const stage = stages.find((s) => s.id === stageId);
  const Section = stage.Section;

  useDocumentTitle(`${stage.label} · Deva Surya`);

  return (
    <LevelLayout stage={stage}>
      {/* Bar stage sudah tampil; hanya isinya yang menunggu chunk-nya. */}
      <Suspense fallback={<StageLoading />}>
        <Section />
      </Suspense>
    </LevelLayout>
  );
};
