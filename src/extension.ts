import * as vscode from "vscode";
import path from "path";
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

      let iconPath = {
        light: vscode.Uri.file(
          path.join(context.extensionPath, "assets", "logo.png")
        ),
        dark: vscode.Uri.file(
          path.join(context.extensionPath, "assets", "logo.png")
        ),
      };

      panel.iconPath = iconPath;

      showView(panel);
    })
  );
}

async function showView(panel: vscode.WebviewPanel) {
  let standings: Standing[] | null = null;

  panel.webview.html = getLoadingSpinner();

  try {
    const response = await fetch(endpoint);
    const parsedResponse = (await response.json()) as ApiResponse;
    standings = parsedResponse.standings;
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to fetch ekstraklasa data`);
  }

  panel.webview.html = getWebviewContent(standings);
}

function getLoadingSpinner() {
    

  return /*html*/ `
    <!DOCTYPE html>
	<html lang="en">
	  <head>
	  	<meta charset="UTF-8">
	  	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	  	<title>Ekstraklasa Table</title>
      ${styles()}
	  </head>
	  <body>
      <div class="loader-wrapper">
        <div class="loader"></div>
      </div>
	  </body>
	</html>

  `;
}

function getWebviewContent(standings: Standing[] | null) {
  return /*html*/ `
  <!DOCTYPE html>
	<html lang="en">
	  <head>
	  	<meta charset="UTF-8">
	  	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	  	<title>Ekstraklasa Table</title>
      ${styles()}
	  </head>
	  <body>
      <div class="wrapper">
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
          ${parseStandings(standings)}
      </div>
	  </body>
	</html>
  `;
}

function parseStandings(standings: Standing[] | null) {
  if (!standings) {
    return "";
  }

  return standings.map((standing) => standingComponent(standing)).join("");
}

function standingComponent(standing: Standing) {
  return /*html*/ `
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
          ${parseLastResults(standing.lastResults)}
        </div>
      </td>
    </tr>
  `;
}

function parseLastResults(lastResults: MATCH_RESULT[]) {
  return lastResults.map((result) => dotComponent(result)).join("");
}

function dotComponent(result: MATCH_RESULT) {
  return /*html*/ `<div class="${
    result === MATCH_RESULT.UNKNOWN ? "empty-dot" : "dot"
  }" style="${
    result === MATCH_RESULT.UNKNOWN ? "border-color" : "background-color"
  }: var(--${resultToColor(result)})"></div>`;
}

function resultToColor(result: MATCH_RESULT) {
  switch (result) {
    case MATCH_RESULT.LOST:
      return "lost-color";
    case MATCH_RESULT.DRAW:
      return "draw-color";
    case MATCH_RESULT.WON:
      return "won-color";
    case MATCH_RESULT.UNKNOWN:
      return "unknown-color";
    default:
      return "unknown-color";
  }
}

function styles() {
  return /*html*/ `
    <style>
      @media only screen and (min-width: 950px) {
        .wrapper {
          margin-left: 10%;
          margin-right: 10%;
          width: 80%;
        }
      }

      :root {
        --lost-color: #D81A34;
        --draw-color: #A5A5A5;
        --won-color: #00E100;
        --unknown-color: #A5A5A5;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }
      td, th {
        text-align: left;
        padding: 8px;
      }
      tr:not(:first-child) {
        border-top: 1px solid;
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
      .dot {
        height: 15px;
        width: 15px;
        border-radius: 50%;
      }
      .empty-dot {
        height: 13px;
        width: 13px;
        border-radius: 50%;
        border-style: solid;
        border-width: 2px;
      }
      .loader-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .loader {
        width: 65px;
        aspect-ratio: 1;
        --g: radial-gradient(farthest-side,#0000 calc(95% - 3px),#fff calc(100% - 3px) 98%,#0000 101%) no-repeat;
        background: var(--g), var(--g), var(--g);
        background-size: 30px 30px;
        animation: l10 1.5s infinite;
      }
      @keyframes l10 {
        0% {
          background-position: 0 0, 0 100%, 100% 100%;
        }
        25% {
          background-position: 100% 0, 0 100%, 100% 100%;
        }
        50% {
          background-position: 100% 0, 0 0, 100% 100%;
        }
        75% {
          background-position: 100% 0, 0 0, 0 100%;
        }
        100% {
          background-position: 100% 100%, 0 0, 0 100%;
        }
      }
    </style>
  `;
}
