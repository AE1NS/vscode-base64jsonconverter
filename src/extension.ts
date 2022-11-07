import * as vscode from "vscode";
import Range = vscode.Range;
import TextEditor = vscode.TextEditor;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("parameterservice.jsonToBase64", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      if (
        editor.selections.length === 1 &&
        editor.document.getText(
          new Range(editor.selections[0].start, editor.selections[0].end)
        ) === ""
      ) {
        vscode.commands.executeCommand("editor.action.selectAll").then(() => {
          convertSelectionsFromJsonToBase64(editor);
        });
      } else {
        convertSelectionsFromJsonToBase64(editor);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("parameterservice.base64ToJson", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      if (
        editor.selections.length === 1 &&
        editor.document.getText(
          new Range(editor.selections[0].start, editor.selections[0].end)
        ) === ""
      ) {
        vscode.commands.executeCommand("editor.action.selectAll").then(() => {
          convertSelectionsFromBase64ToJson(editor);
        });
      } else {
        convertSelectionsFromBase64ToJson(editor);
      }
    })
  );
}

export function deactivate() {}

function convertSelectionsFromJsonToBase64(editor: TextEditor) {
  editor.edit(function (edit) {
    editor.selections.forEach(function (s) {
      const text: string = editor.document.getText(new Range(s.start, s.end));
      if (!text) {
        return;
      }
      try {
        const b: Buffer = Buffer.from(
          encodeURIComponent(JSON.stringify(JSON.parse(text)))
        );
        edit.replace(s, b.toString("base64"));
      } catch (e) {
        vscode.window.showInformationMessage(
          "jsonToBase64: Could not convert to Base64"
        );
      }
    });
  });

  if (
    editor.selections.length === 1 &&
    editor.document.getText().length ===
      editor.document.getText(
        new Range(editor.selections[0].start, editor.selections[0].end)
      ).length
  ) {
    vscode.languages.setTextDocumentLanguage(editor.document, "plaintext");
  }
}

function convertSelectionsFromBase64ToJson(editor: TextEditor) {
  editor.edit(function (edit) {
    editor.selections.forEach(function (s) {
      const text: string = editor.document.getText(new Range(s.start, s.end));
      if (!text) {
        return;
      }
      try {
        const b: Buffer = Buffer.from(decodeURIComponent(text), "base64url");
        edit.replace(
          s,
          JSON.stringify(JSON.parse(decodeURIComponent(b.toString())))
        );
      } catch (e) {
        vscode.window.showInformationMessage(
          "base64ToJson: Could not convert to JSON"
        );
      }
    });
  });

  if (
    editor.selections.length === 1 &&
    editor.document.getText().length ===
      editor.document.getText(
        new Range(editor.selections[0].start, editor.selections[0].end)
      ).length
  ) {
    vscode.languages
      .setTextDocumentLanguage(editor.document, "json")
      .then(() => {
        vscode.commands.executeCommand("editor.action.formatDocument");
      });
  }
}
