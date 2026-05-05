# Claude Entry Point

這個檔案是給 Claude 使用的快捷入口。

本 workspace 的正式規範與工作流程定義都放在 .github，請優先讀取以下檔案，不要在這裡維護第二份規則：

1. `.github/copilot-instructions.md`
2. `.github/skills/using-agent-skills/SKILL.md`
3. `.github/skills/` 底下與目前任務對應的 `SKILL.md`

工作方式：

1. 先用 `.github/copilot-instructions.md` 判斷目前任務所處的開發階段。
2. 再讀取對應 skill 的 `SKILL.md`，並依照其中流程執行。
3. 若規則衝突，以 `.github/copilot-instructions.md` 為主。

請把 .github 視為這個 repo 的唯一真實來源。
