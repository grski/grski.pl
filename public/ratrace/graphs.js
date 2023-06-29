const sectionWidth = () => (document.getElementById("container").offsetWidth * .99);

const defaultChartLayout = (title = "Default Chart", width = .5, height = null) => (
    {width: sectionWidth() * width, height: height, title: title}
)
const makeGraphHoriziontal = (json) => {
    [json.x, json.y] = [json.y, json.x];
    return json
};
const fetchAndGraph = async (jsonFileName, barName, layout, enrich = {}) => {
    fetch(jsonFileName).then(
        response => response.json()
    ).then(json => {
            if (enrich.hasOwnProperty("orientation") && enrich.orientation === "h") {
                json = json.map(makeGraphHoriziontal)
            }
            Plotly.newPlot(barName, json.map((value,) => ({...value, ...enrich})), layout, {responsive: true})
        }
    );
};
const graphCommitsPerDayPerAuthor = async (project) => {
    let layout = defaultChartLayout("Daily commits per team member", 1);
    layout.yaxis = {type: "log", autorange: true};
    layout.xaxis = {
        autorange: true,
        rangeselector: {
            buttons: [
                {
                    count: 1,
                    label: '1m',
                    step: 'month',
                    stepmode: 'backward'
                },
                {
                    count: 6,
                    label: '6m',
                    step: 'month',
                    stepmode: 'backward'
                },
                {step: 'all'}
            ]
        },
        rangeslider: {},
        type: 'date'
    }
    return await fetchAndGraph(`json/${project}/commits_per_day_per_author.json`, "daily", layout, {type: "bar"});
};
const graphCommitsPerDayTeam = async (project) => {
    let layout = defaultChartLayout("Daily commits for the whole team", 1, 700);
    layout.xaxis = {
        autorange: true,
        rangeselector: {
            buttons: [
                {
                    count: 1,
                    label: '1m',
                    step: 'month',
                    stepmode: 'backward'
                },
                {
                    count: 6,
                    label: '6m',
                    step: 'month',
                    stepmode: 'backward'
                },
                {step: 'all'}
            ]
        },
        rangeslider: {},
        type: 'date'
    }
    return await fetchAndGraph(`json/${project}/commits_per_day_team.json`, "dailyTeam", layout, {type: "bar"});
};
const graphCommitsPerHourPerAuthor = async (project) => {
    let layout = defaultChartLayout(`Commits per hour per team member`, .7);
    layout.yaxis = {type: "log", autorange: true}
    return await fetchAndGraph(`json/${project}/commits_per_hour_per_author.json`, "hourly", layout, {type: "bar"});
};
const graphCommitsPerHourTeam = async (project) => {
    let layout = defaultChartLayout("Commits per hour for the whole team", .5);
    return await fetchAndGraph(`json/${project}/commits_per_hour_team.json`, "hourlyTeam", layout, {
        type: "bar",
        orientation: "h"
    });
};

const graphCommitsPerMonthAuthor = async (project) => {
    let layout = defaultChartLayout("Commits per month per team member", 1);
    //layout.yaxis = {type: "log", autorange: true};
    return await fetchAndGraph(`json/${project}/commits_per_month_per_author.json`, "monthly", layout, {type: "bar"});
};

const graphCommitsPerMonthTeam = async (project) => {
    let layout = defaultChartLayout("Mothly commits for the whole team", .7);
    return await fetchAndGraph(`json/${project}/commits_per_month_team.json`, "monthlyTeam", layout, {type: "bar"});
};

const graphCommitsPerWeekdayTeam = async (project) => {
    let layout = defaultChartLayout("Commits per hour for the whole team", .5);
    layout.yaxis = {side: "right", xanchor: "right"}
    return await fetchAndGraph(`json/${project}/commits_per_weekday_team.json`, "weekdaysTeam", layout, {
        type: "bar",
        orientation: "h",
    });
};

const graphCommitsTotal = async (project) => {
    let layout = defaultChartLayout("Total commits per team member", .3,);
    layout.annotations = [
        {
            font: {
                size: 20
            },
            showarrow: false,
            text: 'Commits',
            x: 0.5,
            y: 0.5
        }]
    return await fetchAndGraph(`json/${project}/total_pie_chart.json`, "total", layout, {hole: .6, type: "pie"})
};

const graphCommitsWeekdaysPie = async (project) => {
    let layout = defaultChartLayout("Commits per weekday for the whole team", .3,);
    layout.annotations = [
        {
            font: {
                size: 20
            },
            showarrow: false,
            text: 'Commits',
            x: 0.5,
            y: 0.5
        }]
    return await fetchAndGraph(`json/${project}/weekdays_commits_pie.json`, "weekdaysPie", layout, {hole: .6, type: "pie"})
};


export {
    graphCommitsTotal,
    graphCommitsPerHourPerAuthor,
    graphCommitsPerDayPerAuthor,
    graphCommitsPerMonthTeam,
    graphCommitsWeekdaysPie,
    graphCommitsPerMonthAuthor,
    graphCommitsPerDayTeam,
    graphCommitsPerHourTeam,
    graphCommitsPerWeekdayTeam
};
