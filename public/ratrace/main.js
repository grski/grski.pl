import {
    graphCommitsTotal,
    graphCommitsPerHourPerAuthor,
    graphCommitsPerDayPerAuthor,
    graphCommitsPerMonthTeam,
    graphCommitsWeekdaysPie,
    graphCommitsPerMonthAuthor,
    graphCommitsPerDayTeam,
    graphCommitsPerHourTeam,
    graphCommitsPerWeekdayTeam
} from "./graphs.js";
import {putCommiters, putFileLengths} from "./tables.js";

const render = async (project) => {
    document.getElementById("projectName").innerText = `${project}\n Short summary:`;
    await graphCommitsPerDayPerAuthor(project);
    await graphCommitsPerDayTeam(project);

    await graphCommitsPerHourPerAuthor(project);
    await graphCommitsPerHourTeam(project);

    await graphCommitsPerMonthAuthor(project);

    await graphCommitsPerMonthTeam(project);

    await graphCommitsPerWeekdayTeam(project);
    await graphCommitsWeekdaysPie(project);

    await graphCommitsTotal(project);
    await putFileLengths(project);
    await putCommiters(project);
}
const surveyButton = document.getElementById("survey");
surveyButton.addEventListener("click", () => render("survey-engine"));
const backendButton = document.getElementById("backend");
backendButton.addEventListener("click", () => render("deeptrue-backend"));

render("survey-engine");
