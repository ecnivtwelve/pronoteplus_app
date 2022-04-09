// ______                      _             
// | ___ \                    | |        _   
// | |_/ / __ ___  _ __   ___ | |_ ___ _| |_ 
// |  __/ '__/ _ \| '_ \ / _ \| __/ _ \_   _|
// | |  | | | (_) | | | | (_) | ||  __/ |_|  
// \_|  |_|  \___/|_| |_|\___/ \__\___|      
//  JavaScript d'affichage
//  Pronote+ version 2.1
//  Fait par Vince Linise (sous Aihvah Interactve)
//  API : https://www.npmjs.com/package/@dorian-eydoux/pronote-api

// objects
    let pronote = new Object();
    pronote.server = new Object();
    pronote.ui = new Object();
    pronote.process = new Object();
    pronote.data = new Object();

// app functions
    function hashtag(id) {
        return document.getElementById(id);
    }

    function lastWord(words) {
        let n = words.split(" ");
        return n[n.length - 1];
    }

    function go() {
        hashtag("qoa2neuf").dismiss();

        localStorage.setItem("passedSetup", "true");
    }

    function diff_minutes(dt2, dt1) 
    {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff)); 
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

    function pronote_getDate(nb) {
        let today = nb
        today.setTime(today.setMonth(today.getMonth()+1))
        let year = today.getFullYear();
        let month = today.getMonth();
        let day = today.getDate();
    
        let rn = `${year}/${month}/${day}`
        return(rn);
    }

    const sheetModal3 = document.querySelector('#MarkFull');
    sheetModal3.breakpoints = [0.0, 0.5, 1];
    sheetModal3.initialBreakpoint = 0.5;

    function openDate() {
        document.querySelector('#DateSelect').present();
    }
    
    function confirmDate() {
        document.querySelector('#DateSelect').dismiss();
        let date = new Date(document.querySelector('#DateSelector').value)

        console.log(date)
    }

// pronote vars
pronote.data.timetable = [];

// ui functions
    // show login screen
    pronote.ui.login = function() {
        // check if passwords saved

        if(localStorage.getItem('unsecure_username') !== null) {
            pronote.server.fetch(localStorage.getItem('unsecure_username'), localStorage.getItem('unsecure_password'),localStorage.getItem('unsecure_url'),localStorage.getItem('unsecure_cas'));
        }
        else {
            hashtag("LoginScreen").present();
        }
    }

    // if no internet
        pronote.ui.noInternet = function(hashtag2) {
            hashtag(hashtag2).innerHTML = `
                    <div class="NoData">
                        <img src="./img/internet.svg">
                        <p>Impossible de se connecter.</p>
                        <small>Essayez d'activer vos données mobiles ou le Wi-Fi.</small>
                    </div>
                `
        }
        
        pronote.ui.noInternetAll = function() {
            pronote.ui.noInternet("timetable-inner");
            pronote.ui.noInternet("homework-inner");
            pronote.ui.noInternet("marks");
            pronote.ui.noInternet("news");
        }
    
    // show timetable
    pronote.ui.timetable = function(data) {
        hashtag("timetable-inner").innerHTML = "";
    
        let incr = 0;
    
        if(data.length == 0) {
            ui_noData("timetable-inner");
        }
        else {
            hashtag("coursLength").innerHTML = data.length;

            for (var lesson of data) 
            {
                let heureCours = new Date(lesson.from);
                heureCours.setHours(heureCours.getHours() - 2);
                let formattedTime = ("0" + heureCours.getHours()).slice(-2) + ":" + ("0" + heureCours.getMinutes()).slice(-2);
        
                let heureFin = new Date(lesson.to);
                heureFin.setHours(heureFin.getHours() - 2);
                let formattedTimeTo = ("0" + heureFin.getHours()).slice(-2) + ":" + ("0" + heureFin.getMinutes()).slice(-2);
        
                let diff = diff_minutes(heureFin, heureCours);
        
                if(lesson.room == null) {
                    lesson.room = "inconnue";
                }
        
                if(lesson.teacher == null) {
                    lesson.teacher = "on sait pas qui";
                }
        
                let lessonStatus = "";

                if(typeof(lesson.status) !== "undefined") {
                    lessonStatus = `
                    <ion-chip class="lessonStatus" color="secondary">
                        <ion-label color="secondary">${lesson.status}</ion-label>
                    </ion-chip>
                    `
                }
        
                if(lesson.isCancelled !== true) {
                    hashtag("timetable-inner").innerHTML+=`
                    <ion-item class="lessonContainer">
                        <div class="lesson procedItem" style="--incr: ${incr * 50}ms;--lesson-color: ${lesson.color};">
                            <div class="left_line"></div>
                            <div>
                                <h1>${lesson.subject}${lessonStatus}</h1>
                                <small>de ${formattedTime} à ${formattedTimeTo} (${diff} minutes)</small>
                                <p>${lesson.teacher} – ${lesson.room}</p>
                            </div>
                        </div>
                    </ion-item>
                `
                }
        
                incr = incr + 1;
            }
        }
    }

    pronote.ui.homeworks = function(data) {
        hashtag("homework-inner").innerHTML = "";
        let incr = 0;

        hashtag("devoirsLength").innerHTML = data.length;
    
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

    // marks var
    let AllNotes = 0;
    let AllMoyenne = 0;
    let NbNotes;

    pronote.ui.marks = function(data) {
        hashtag("marks").innerHTML = `
            <div class="mark average">
                <p>Moyenne générale</p>
                <h3><span id="aver">N.noté</span><sm>/20</sm></h3>
                <small>Moyenne de la classe : <span id="averClass">N.noté</span>/20</small>
            </div>
            <ion-accordion-group id="allMarks">
            </ion-accordion-group>
        `;
        let allCourses = data.subjects;
    
        let incr = 0;
        AllNotes = 0;
        AllMoyenne = 0;
        NbNotes = 0;

        AllNotesClass = 0;
        AllMoyenneClass = 0;
    
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
            AllNotesClass = AllNotesClass + subject.averages.studentClass;
    
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

            let AllMoyenneClass = AllNotesClass / NbNotes;
            hashtag('averClass').innerHTML = AllMoyenneClass.toFixed(2);
        }
    }

    pronote.ui.news = function(data) {
        hashtag("news").innerHTML = "";

        hashtag("newsLength").innerHTML = data.length;
    
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

// process functions
    // get login data
    pronote.process.login = function() {
        let username = hashtag("login_username").value
        let password = btoa(hashtag("login_password").value)
        let url = hashtag("login_url").value
        let cas = hashtag("login_cas").value

        pronote.server.fetch(username, password, url, cas);
    }

// server functions
    // actually login and get data
    pronote.server.fetch = function(username, password, url, cas) {
        let URL = `https://api.allorigins.win/get?url=https://pronotesquared.herokuapp.com/all?url=${url}%26username=${username}%26password=${atob(password)}%26cas=${cas}`;

        async function sync() {
            const response = await fetch(URL);
            const json = await response.json();

            if(json.contents === "Mauvais identifiants") {
                hashtag("fakeWebWrong").style.display = "block";
                window.localStorage.clear();
            }
            else {
                let resp = JSON.parse(json.contents);

                // save password
                localStorage.setItem("unsecure_username", username);
                localStorage.setItem("unsecure_password", password);
                localStorage.setItem("unsecure_url", url);
                localStorage.setItem("unsecure_cas", cas);

                // get name 
                localStorage.setItem("personnal_name", lastWord(resp.data.nom));
                localStorage.setItem("personnal_class", resp.data.classe);
                
                // dismiss UI and call all functions
                hashtag("LoginScreen").dismiss();
                
                pronote.ui.timetable(resp.timetable);
                pronote.ui.homeworks(resp.homeworks);
                pronote.ui.marks(resp.marks);
                pronote.ui.news(resp.infos);
            }
        }

        sync();
    }

// run
    // load icons
    lucide.createIcons();

    // load UI when loaded
    window.addEventListener("load", function(){
        pronote.ui.login();
    });

function ui_noData() {
    //nothing
}