// You're probably wondering why is there an app_old.js ?
// It's actually because this was planned to release in GraphQL, but server limitations made this solution impossible.
// So the other "app.js" contains a rewritten code, made to work with pronote_squared (REST API)

// make icons
lucide.createIcons();

// consts
const LoginURL = "http://localhost/login";
const APIURL = "http://localhost/";

// Traitement du login
function makeLoginURL(url, username, password, cas) {
    return LoginURL + `/?url=${url}&username=${username}&password=${password}&cas=${cas}`
}

function logN(u, p) {
    let URL = makeLoginURL("https://0350053t.pronote.toutatice.fr/pronote", u, p, "toutatice");

    async function loadToken() {
        try {
            const response = await fetch(URL);
            const JSON = await response.json();

            if(JSON.hasOwnProperty('token')) {
                // save token
                localStorage.setItem("pronoteplus_userToken", JSON.token);
                // save credentials
                localStorage.setItem("pronoteplus_userName", u);
                localStorage.setItem("pronoteplus_userPass", btoa(p));

                hashtag("LoginScreen").dismiss();
                tryToken();
            }
            else if(JSON.hasOwnProperty('code')){
                if(JSON.code == 2) {
                    noWeb2();
                    console.log("Pronote+Log : Exclusion du serveur Pronote")
                }
            }
            else {
                hashtag("fakeWebWrong").style.display = "block";
                hashtag("loginBtn").style.backgroundColor = "#005555";
            }
        }
        catch {
            noWeb();
        }
    }

    loadToken();
}

function ui_login() {
    hashtag("loginBtn").style.backgroundColor = "#005555";

    let username = hashtag("login_username").value
    let password = hashtag("login_password").value

    logN(username, password)
}

if(localStorage.getItem('pronoteplus_userToken') !== null) {
    tryToken();
}
else {
    if(localStorage.getItem('pronoteplus_userPass') !== null) {
        logN(localStorage.getItem("pronoteplus_userName"), atob(localStorage.getItem("pronoteplus_userPass")))
    }
    else {
        setTimeout(() => {
            hashtag("LoginScreen").present();
        }, 100);
    }
}

if(window.navigator.standalone !== true) {
    setTimeout(() => {
        hashtag("AskPWA").present();
    }, 200);
}

function tryToken() {
    setTimeout(() => {
        hashtag("LoginScreen").dismiss();
    }, 200);
    let token = localStorage.getItem('pronoteplus_userToken');

    let demain = new Date();
    demain.setHours(demain.getHours() + 24)
    
    pronote_getTimeTable(pronote_getDate(new Date()))
}

// datetime
const sheetModal = document.querySelector('#DateSelect');
sheetModal.initialBreakpoint = 0.6;

function openDate() {
    document.querySelector('#DateSelect').present();
}

function confirmDate() {
    document.querySelector('#DateSelect').dismiss();
    pronote_getTimeTable(pronote_getDate(new Date(document.querySelector('#DateSelector').value)))
}

const sheetModal2 = document.querySelector('#DateSelect2');
sheetModal2.initialBreakpoint = 0.6;

function openDate2() {
    document.querySelector('#DateSelect2').present();
}

function confirmDate2() {
    document.querySelector('#DateSelect2').dismiss();
    pronote_getHomework(pronote_getDate(new Date(document.querySelector('#DateSelector2').value)))
}

// global functions
function diff_minutes(dt2, dt1) 
{
    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff)); 
}

// pronote functions
function pronote_getDate(nb) {
    let today = nb
    today.setTime(today.setMonth(today.getMonth()+1))
    let year = today.getFullYear();
    let month = today.getMonth();
    let day = today.getDate();

    let rn = `${year}/${month}/${day}`
    return(rn);
}

let pronote_timetable = [];
let pronote_homework = [];
let pronote_marks = [];
let pronote_news = [];

function pronote_getAll(date) {
    let token = localStorage.getItem('pronoteplus_userToken');
    let URL = `${APIURL}all?token=${token}&date=${date}`;

    async function load() {
            const response = await fetch(URL);
            const JSON = await response.json();
    
            if(JSON.timetable == null) {
                localStorage.removeItem("pronoteplus_userToken");
                hashtag("LoginScreen").present();
    
                logN(localStorage.getItem("pronoteplus_userName"), atob(localStorage.getItem("pronoteplus_userPass")))
            
            }
            else {
                // load all
                pronote_timetable = JSON.timetable;
                pronote_homework = JSON.homework;
                pronote_marks = JSON.marks;
                pronote_news = JSON.news;
                ui_TimeTable(pronote_timetable);
                ui_Homework(pronote_homework);
                ui_Marks(pronote_marks);
                ui_News(pronote_news);
            }
    }

    load();
}

function pronote_getTimeTable(date) {
    let token = localStorage.getItem('pronoteplus_userToken');
    let URL = `${APIURL}timetable?token=${token}&date=${date}`;

    async function load() {
            const response = await fetch(URL);
            const JSON = await response.json();
    
            if(JSON.timetable == null) {
                localStorage.removeItem("pronoteplus_userToken");
                hashtag("LoginScreen").present();
    
                logN(localStorage.getItem("pronoteplus_userName"), atob(localStorage.getItem("pronoteplus_userPass")))
            
            }
            else {
                // load all
                let demain = new Date();
                demain.setHours(demain.getHours() + 24)
                pronote_getHomework(pronote_getDate(demain))
                pronote_getMarks()
                pronote_getNews()
            }
            
            pronote_timetable = JSON.timetable;
            ui_TimeTable(pronote_timetable);
    }

    load();
}

function pronote_getHomework(date) {
    let token = localStorage.getItem('pronoteplus_userToken');
    let URL = `${APIURL}homework?token=${token}&date=${date}`;

    async function load() {
        const response = await fetch(URL);
        const JSON = await response.json();

        if(JSON.homeworks == null) {
            
        }
        else {
            pronote_homework = JSON.homeworks;
            ui_Homework(pronote_homework);
        }
    }

    load();
}

function pronote_getMarks() {
    let token = localStorage.getItem('pronoteplus_userToken');
    let URL = `${APIURL}marks?token=${token}`;

    async function load() {
        const response = await fetch(URL);
        const JSON = await response.json();

        if(JSON.marks == null) {
            
        }
        else {
            pronote_marks = JSON.marks;
            ui_Marks(pronote_marks);
        }
    }

    load();
}

function pronote_getNews() {
    let token = localStorage.getItem('pronoteplus_userToken');
    let URL = `${APIURL}info?token=${token}`;

    async function load() {
        const response = await fetch(URL);
        const JSON = await response.json();

        if(JSON.infos == null) {
            
        }
        else {
            pronote_news = JSON.infos;
            ui_News(pronote_news);
        }
    }

    load();
}

// ui functions
function ui_TimeTable(data) {
    hashtag("timetable-inner").innerHTML = "";

    let incr = 0;

    if(data.length == 0) {
        ui_noData("timetable-inner");
    }
    else {
        for (var lesson of data) 
        {
            let heureCours = new Date(lesson.from);
            let formattedTime = ("0" + heureCours.getHours()).slice(-2) + ":" + ("0" + heureCours.getMinutes()).slice(-2);
    
            let heureFin = new Date(lesson.to);
            let formattedTimeTo = ("0" + heureFin.getHours()).slice(-2) + ":" + ("0" + heureFin.getMinutes()).slice(-2);
    
            let diff = diff_minutes(heureFin, heureCours);
    
            if(lesson.room == null) {
                lesson.room = "inconnue";
            }
    
            if(lesson.teacher == null) {
                lesson.teacher = "on sait pas qui";
            }
    
            let lessonStatus = "";
    
            if(lesson.status !== null) {
                lessonStatus = `
                <ion-chip class="lessonStatus" color="secondary">
                    <ion-label color="secondary">${lesson.status}</ion-label>
                </ion-chip>
                `
            }
    
            if(lesson.isCancelled !== true) {
                hashtag("timetable-inner").innerHTML+=`
                <ion-item button class="lessonContainer">
                    <div class="lesson procedItem" style="--incr: ${incr * 50}ms;--lesson-color: ${lesson.color};">
                        <div class="left_line"></div>
                        <div>
                            <h1>${lesson.subject}${lessonStatus}</h1>
                            <small>de ${formattedTime} à ${formattedTimeTo} (${diff} minutes)</small>
                            <p>avec ${lesson.teacher}</p>
                            <p>salle ${lesson.room}</p>
                        </div>
                    </div>
                </ion-item>
            `
            }
    
            incr = incr + 1;
        }
    }
}

function ui_noData(hashtag2) {
    hashtag(hashtag2).innerHTML = `
            <div class="NoData">
                <img src="./img/multitask.svg">
                <p>Rien à afficher !</p>
                <small>Profites bien de ta journée, car t'as rien à faire !</small>
            </div>
        `
}

function ui_Homework(data) {
    hashtag("homework-inner").innerHTML = "";
    let incr = 0;

    for (var homework of data) 
    {
        let files = "";

        if(homework.files.length > 0) {
            let tt = homework.files[0].name;
            let rl = homework.files[0].url;

            if(tt == "undefined") {
                tt = "Pièce jointe";
            }

            files = `<a class="files" href="${rl}">${tt}</a>`
        }

        hashtag("homework-inner").innerHTML+=`
        <ion-item-sliding id="homework_${incr}">
            <ion-item style="--incr: ${incr * 50}ms" class="procedItem homeworkContainer" button onclick="checkDone('homework_${incr}')">
                <div class="homework">
                    <small>${homework.subject}</small>
                    <p>${homework.description}</p>
                    ${files}
                </div>
            </ion-item>
            <ion-item-options side="start">
                <ion-item-option onClick="done('homework_${incr}')" color="success">Fait !</ion-item-option>
            </ion-item-options>
        </ion-item-sliding>
        `

        incr = incr + 1;
    }

    if(data.length == 0) {
        ui_noData("homework-inner");
    }
}

function checkDone(id) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = 'Etes-vous sur ?';
    alert.message = 'Vous avez fini ce devoir ?';
    alert.buttons = [
      {
        text: "OK, j'ai menti",
        role: 'cancel',
        cssClass: 'secondary',
        id: 'cancel-button',
        handler: (blah) => {
            // nothing
        }
      }, {
        text: "Oui, c'est fait !",
        id: 'confirm-button',
        handler: () => {
            done(id)
        }
      }
    ];
  
    document.body.appendChild(alert);
    return alert.present();
}

function done(id) {
    document.getElementById(id).classList.add("done");
    setTimeout(() => {
        document.getElementById(id).style.display = "none";
    }, 200);
}

function ui_News(data) {
    hashtag("news").innerHTML = "";

    let incr = 0;

    for (var i = data.length - 1; i >= 0; i--) 
    {
        let news = data[i];
        let heureNews = new Date(news.date);
        let localHeureNews = heureNews.toLocaleDateString("fr")

        let files = "";

        if(news.files.length > 0) {
            let tt = news.files[0].name;
            let rl = news.files[0].url;

            if(tt == "undefined") {
                tt = "Pièce jointe";
            }

            files = `<a class="files" href="${rl}">${tt}</a>`
        }

        if(news.title == null) {
            news.title = "";
        }

        hashtag("news").innerHTML+=`
            <ion-item style="--incr: ${incr * 50}ms" class="procedItem homeworkContainer">
                <div class="news">
                    <h3>${news.title}</h3>
                    <small>${news.author} — ${localHeureNews}</small>
                    <p>${news.content}</p>
                    ${files}
                </div>
            </ion-item>
        `

        incr = incr + 1;
    }

    if(data.length == 0) {
        ui_noData("news");
    }
}

let AllNotes = 0;
let AllMoyenne = 0;
let NbNotes;

function ui_Marks(data) {
    hashtag("marks").innerHTML = `
        <div class="mark average">
            <p>Moyenne générale</p>
            <h3><span id="aver">N.noté</span><sm>/20</sm></h3>
        </div>
        <ion-accordion-group id="allMarks">
        </ion-accordion-group>
    `;
    let allCourses = data.subjects;

    let incr = 0;
    AllNotes = 0;
    AllMoyenne = 0;
    NbNotes;

    for (var subject of allCourses) 
    {
        console.log(subject)
        hashtag("allMarks").innerHTML+=`
            <ion-accordion style="--incr: ${incr * 50}ms" class="procedItem"  value="${subject.name}">
                <ion-item slot="header" style="--lesson-color: ${subject.color};">
                    <div class="left_line"></div>
                    <div class="MarkIntroduction">
                        <h3>${subject.name}</h3>
                        <p>Moyenne : <b><span id="grade_${incr}" class="grade">${subject.averages.student}</span><sm>/20</sm></b></p>
                        <p2>Moyenne de la classe : <b>${subject.averages.studentClass}<sm>/20</sm></b></p2>
                    </div>
                </ion-item>
                <ion-list id="marks_${incr}" slot="content">
                </ion-list>
            </ion-accordion>
        `

        AllNotes = AllNotes + subject.averages.student;

        let allMark = subject.marks

        let incr2 = 0;

        for(var mark of allMark) {
            try {
            let out20step1 = mark.value / mark.scale;
            let out20 = (out20step1 * 20).toFixed(2)

            hashtag(`marks_${incr}`).innerHTML+=`
            <div class="mark" onclick="fullNote('${mark.title}',${out20},${mark.value}, ${mark.scale}, ${mark.max}, ${mark.min}, ${mark.coefficient}, ${mark.average})">
                <p>${mark.title}</p>
                <h3><span id="grade_${incr2}" class="grade">${out20}</pan><sm>/20</sm></h3>
                <small>Note originale : ${mark.value}/${mark.scale}</small>
            </div>
        `
            }
            catch {
            hashtag(`marks_${incr}`).innerHTML+=`
            <div class="mark">
                <small>Note non comptabilisée par Pronote+.</small>
            </div>
        `
            }

            incr2 = incr2 + 1;
        }

        incr = incr + 1;
        NbNotes = incr;

        let AllMoyenne = AllNotes / NbNotes;
        hashtag('aver').innerHTML = AllMoyenne.toFixed(2);
    }
}

function getRndInteger(min, max) {
    return Math.random() * (max - min) + min;
}

function wow() {
    var childDivs = document.getElementsByClassName("grade");

    for( i=0; i< childDivs.length; i++ )
    {
        var childDiv = childDivs[i];
        bestNote = getRndInteger(19, 20);

        childDiv.innerHTML = bestNote.toFixed(2);
    }

    hashtag('aver').innerHTML = getRndInteger(19, 20).toFixed(2);
}

function fullNote(title, out20, value, scale, max, min, coef, average) {
    hashtag('MarkFullTitle').innerHTML = title;
    hashtag('MarkFullOut20').innerHTML = out20;
    hashtag('MarkFullValue').innerHTML = value;
    hashtag('MarkFullScale').innerHTML = scale;

    hashtag('MarkFullMax').innerHTML = (max / scale * 20).toFixed(2);
    hashtag('MarkFullMin').innerHTML = (min / scale * 20).toFixed(2);
    hashtag('MarkFullAverage').innerHTML = (average / scale * 20).toFixed(2);
    hashtag('MarkFullCoef').innerHTML = coef;

    hashtag(`MarkFull`).present();
}

const sheetModal3 = document.querySelector('#MarkFull');
sheetModal3.breakpoints = [0.1, 0.5, 1];
sheetModal3.initialBreakpoint = 0.5;

function ui_noWeb(hashtag2) {
    hashtag(hashtag2).innerHTML = `
            <div class="NoData">
                <img src="./img/internet.svg">
                <p>Impossible de se connecter.</p>
                <small>Essayez d'activer vos données mobiles ou le Wi-Fi.</small>
            </div>
        `
}

function noWeb() {
    ui_noWeb("timetable-inner");
    ui_noWeb("homework-inner");
    ui_noWeb("marks");
    ui_noWeb("news");
}


function ui_noWeb2(hashtag2) {
    hashtag(hashtag2).innerHTML = `
            <div class="NoData">
                <img src="./img/server.svg">
                <p>Erreur du serveur Pronote+.</p>
                <small>Veuillez patienter le temps que ça revienne.</small>
            </div>
        `
}

function noWeb2() {
    ui_noWeb2("timetable-inner");
    ui_noWeb2("homework-inner");
    ui_noWeb2("marks");
    ui_noWeb2("news");
}

if(window.navigator.onLine == false) {
    noWeb();
}
