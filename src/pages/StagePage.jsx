import { stages } from "@/data/stages";
import { LevelLayout } from "@/layouts/LevelLayout";

export const StagePage = ({ stageId }) => {
  const stage = stages.find((s) => s.id === stageId);
  const Section = stage.Section;

  return (
    <LevelLayout stage={stage}>
      <Section />
    </LevelLayout>
  );
};
