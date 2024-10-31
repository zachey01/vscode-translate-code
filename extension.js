const vscode = require("vscode");
const axios = require("axios");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "translateCode.translate",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const code = editor.document.getText();
        const languages = [
          "Pascal",
          "JavaScript",
          "TypeScript",
          "Python",
          "TSX",
          "JSX",
          "Vue",
          "Go",
          "C",
          "C++",
          "Java",
          "C#",
          "Visual Basic .NET",
          "SQL",
          "Assembly Language",
          "PHP",
          "Ruby",
          "Swift",
          "SwiftUI",
          "Kotlin",
          "R",
          "Objective-C",
          "Perl",
          "SAS",
          "Scala",
          "Dart",
          "Rust",
          "Haskell",
          "Lua",
          "Groovy",
          "Elixir",
          "Clojure",
          "Lisp",
          "Julia",
          "Matlab",
          "Fortran",
          "COBOL",
          "Bash",
          "Powershell",
          "PL/SQL",
          "CSS",
          "Racket",
          "HTML",
          "NoSQL",
          "CoffeeScript",
        ];
        const selectedLanguage = await vscode.window.showQuickPick(languages, {
          placeHolder: "Select the language to be translated",
        });

        if (selectedLanguage) {
          const prompt = `Rewrite this code to ${selectedLanguage}. Write only code, without Markdown:\n${code}`;

          try {
            const response = await axios.post(
              "https://nexra.aryahcr.cc/api/chat/gpt",
              {
                messages: [{ role: "user", content: prompt }],
                prompt: "Translate code",
                model: "GPT-4",
                markdown: false,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            let id = response.data.id;

            let statusResponse;
            while (true) {
              statusResponse = await axios.get(
                `https://nexra.aryahcr.cc/api/chat/task/${encodeURIComponent(
                  id
                )}`
              );
              if (statusResponse.data.status !== "pending") {
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            if (
              statusResponse.data.status === "completed" &&
              statusResponse.data.gpt
            ) {
              editor.edit((editBuilder) => {
                const entireRange = new vscode.Range(
                  editor.document.positionAt(0),
                  editor.document.positionAt(editor.document.getText().length)
                );
                editBuilder.delete(entireRange);

                editBuilder.insert(
                  new vscode.Position(0, 0),
                  statusResponse.data.gpt
                );
              });
            } else {
              vscode.window.showErrorMessage(
                "Error when receiving the result."
              );
            }
          } catch (error) {
            console.error("Error:", error);
            vscode.window.showErrorMessage(
              "An error occurred when requesting the API."
            );
          }
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
