import * as vscode from "vscode";
import { Standing, ApiResponse, MATCH_RESULT } from "./types";

const endpoint = "https://ekstraklasa.szarbartosz.com/table";

export function activate(context: vscode.ExtensionContext) {
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
      .team-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .image-wrapper {
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        margin-right: 8px;
      }
      .img { 
        width: auto;
        height: auto;
      }
      .last-five{
        display: flex;
        align-items: center;
        gap: 4px;
      }
    </style>
	</head>
	<body>
    <table>
      <tr>
        <th>Club</th>
        <th>MP</th>
        <th>W</th>
        <th>D</th>
        <th>L</th>
        <th>GF</th>
        <th>GA</th>
        <th>GD</th>
        <th>Pts</th>
        <th>Last 5</th>
      </tr>

      ${standings
        .map(
          (standing) => /*html*/ `
        <tr>
          <td class="team-info">
            <div class="image-wrapper">
              <img src="${standing.logoUrl}" alt="${standing.teamName}"/>
            </div>
            <p>${standing.position}</p>
            <p>${standing.teamName}</p>
          </td>
          <td>${standing.gamesPlayed}</td>
          <td>${standing.wins}</td>
          <td>${standing.draws}</td>
          <td>${standing.losses}</td>
          <td>${standing.goalsFor}</td>
          <td>${standing.goalsAgainst}</td>
          <td>${standing.goalsDifference}</td>
          <td>${standing.teamPoints}</td>
          <td>
            <div class="last-five">
              ${standing.lastResults
                .map(
                  (result) => /*html*/ `
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="50" fill=${resultToColor(
                      result
                    )}></circle>
                  </svg>
                `
                )
                .join("")}
            </div>
          </td>
        </tr>
      `
        )
        .join("")}
	</body>
	</html>
  `;
}

function resultToColor(result: MATCH_RESULT) {
  switch (result) {
    case MATCH_RESULT.LOST:
      return "red";
    case MATCH_RESULT.DRAW:
      return "gray";
    case MATCH_RESULT.WON:
      return "green";
  }
}
