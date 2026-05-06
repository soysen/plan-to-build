# Contributing to Plan-to-Build (Agent Skills)

Thank you for your interest in contributing to the Plan-to-Build Agent Skills framework! We welcome contributions that help improve AI Agent workflows, add new skills, or refine existing ones.

## 🌟 How to Contribute

There are several ways you can contribute:
1. **Adding a New Skill**: Create a new workflow for a development phase not currently covered.
2. **Improving Existing Skills**: Refine the prompts, steps, or outputs of an existing skill.
3. **Bug Reports & Feedback**: Found an issue where the Agent hallucinated or failed to follow instructions? Let us know!

## 📝 Adding a New Skill

If you want to add a new `SKILL.md`, please follow these steps strictly:

1. **Use the Template**: All skills MUST follow the standard template. Copy `docs/templates/SKILL-TEMPLATE.md` to your new skill directory:
   ```bash
   mkdir -p .github/skills/<your-new-skill-name>
   cp docs/templates/SKILL-TEMPLATE.md .github/skills/<your-new-skill-name>/SKILL.md
   ```
2. **Fill in the Details**: Define the goal, prerequisites, trigger words, expected outputs, and most importantly, the **Agent Action Plan (執行步驟)**. Make the steps as deterministic as possible.
3. **Update the Router**: Add your new skill to `.github/copilot-instructions.md` in the decision tree and skill catalog so Agents know when to invoke it.
4. **Update README**: Briefly mention your skill in the product lifecycle map in `README.md` and `README_EN.md`.

## ✅ Pull Request Process

1. Fork the repository and create a new branch.
2. Make your changes following the guidelines above.
3. Ensure your new `SKILL.md` passes the CI markdown validation (we check for mandatory headers).
4. Submit your PR and provide a brief explanation of why this skill is needed and an example of how it improves the Agent's behavior.

## 🛡️ Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. Let's build a respectful and inclusive community!
