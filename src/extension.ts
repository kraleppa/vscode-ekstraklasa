import * as vscode from "vscode";
import { Standing, ApiResponse } from "./types";

const endpoint = "https://ekstraklasa.szarbartosz.com";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-ekstraklasa" is now active!'
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-ekstraklasa.helloWorld", () => {
      const panel = vscode.window.createWebviewPanel(
        "ekstraklasaTable",
        "Ekstraklasa Table",
        vscode.ViewColumn.One,
        {}
      );
      showView(panel);
    })
  );
}

async function showView(panel: vscode.WebviewPanel) {
  const response = await fetch(endpoint);
  const parsedResponse = (await response.json()) as ApiResponse;
  const standings = parsedResponse.standings;

  panel.webview.html = getWebviewContent(standings);
}

function getWebviewContent(standings: Standing[]) {
  return /*html*/ `
  <!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Ekstraklasa Table</title>
    <style>
      table {
        border-collapse: collapse;
        width: 100%;
      }
      td, th {
        border: 1px solid;
        text-align: left;
        padding: 8px;
      }
    </style>
	</head>
	<body>
    <table>

      ${standings
        .map(
          (standing) => /*html*/ `
        <tr>
          <td>

            <img src="${standing.logoUrl}" alt="${standing.teamName}" width="20" height="auto"/>
            <p>${standing.position}</p>
            <p>${standing.teamName}</p>
          </td>

          <td>${standing.teamPoints}</td>
          <td>${standing.wins}</td>
          <td>${standing.draws}</td>
          <td>${standing.losses}</td>
          <td>${standing.goalsAgainst}</td>
          <td>${standing.goalsFor}</td>
        </tr>
      `
        )
        .join("")}
	</body>
	</html>
  `;
}
