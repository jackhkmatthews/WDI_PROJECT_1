console.log('js loaded');

$(start);

function start(){
  Redbone.addToNav();
  Lyrics.addToNav();
  Import.addToNav();
  Redbone.start();
}

function Game(title, userInputs, youtubeUrl, linesArray, mins, secs) {

  this.title = title;
  this.youtubeUrl = youtubeUrl;
  this.mins = mins;
  this.secs = secs;
  this.html = '',
  this.form = '',
  this.playButton = '',
  this.songTag = '',
  this.userLyricsHtml = '',
  this.lyricsString = '',
  this.paragraphyHtml = [],
  this.paragraphyTesting = [],
  this.lineTesting = [],
  this.currentCharacterIndex = 0,
  this.currentCharacterOnLineIndex = 0,
  this.linesArray = linesArray,
  this.lineDivs = [],
  this.newLineIndex = 0,
  this.currentLineIndex = 0,
  this.songDuration = 0,
  this.animationDuration = 30000,
  this.height = 300,
  this.numberOfLinesOnScreen = 0,
  this.linesOnScreen = [],
  this.currentCharacterIndexes = [],
  this.stringsToRemove = ['', '[Verse]', '[Verse 1]', '[Verse 2]', '[Verse 3]', '[Verse 4]', '[Verse 5]', '[Bridge 1]', '[Bridge 2]', '[Pre-Hook]','[Outro]', '[Hook]'],
  this.$linesContainer = $(document.createElement('div')).addClass('lyric-container'),
  this.lyricsContainer = '',
  this.hit = 0,
  this.missed = 0,
  this.keysPressed = 0,
  this.time = 3,

  this.start = function start(){
    $('#game').html('');
    this.createHtml();
    this.appendHtml();
    this.makeSubmitListen();
    this.makePlayButtonListen();
    this.makeKeysListen();
    this.audioStuff();
    if (!userInputs) {
      console.log('submit callback');
      this.getLyrics.bind(this)();
      this.parseLyrics.bind(this)();
      this.createLyricSpans.bind(this)();
      this.getDuration.bind(this)();
      this.handleAudio.bind(this)();
    }
  };

  this.addToNav = function addToNav() {
    var element = document.createElement('h2');
    element.innerHTML = this.title;
    element.addEventListener('click', generate.bind(this));
    function generate(){
      this.start();
    }
    var nav = document.getElementById('nav');
    nav.appendChild(element);
  };

  this.createHtml = function createHtml(){
    this.accuracyContainer = this.createAccuracyContainer();
    this.lyricsContainer = this.createLyricsContainer();
    this.form = this.createForm();
    this.playButton = this.createPlayButton();
  },

  this.appendHtml = function appendHtml(){
    $('#game').append([this.accuracyContainer, this.lyricsContainer, this.form, this.playButton]);
  },

  this.createAccuracyContainer = function(){
    var div = document.createElement('div');
    var h1 = document.createElement('h2');
    $(h1).attr('id', 'hit');
    $(h1).html('hit:');
    var h2 = document.createElement('h2');
    $(h2).attr('id', 'missed');
    $(h2).html('missed:');
    var h3 = document.createElement('h2');
    $(h3).attr('id', 'accuracy');
    $(h3).html('accuracy:');
    $(div).append([h1, h2, h3]);
    return div;
  },

  this.createLyricsContainer = function createLyricsContainer(){
    var div = document.createElement('div');
    $(div).addClass('lyrics-container');
    return div;
  },

  this.createForm = function createForm(){
    var form = document.createElement('form');
    $(form).attr('id', 'user-form');

    var textarea = document.createElement('textarea');
    $(textarea).attr('placeholer', 'Lyrics Outer HTML');
    $(textarea).attr('id', 'user-lyrics-html');

    var url = document.createElement('input');
    $(url).attr('type', 'text');
    $(url).attr('placeholer', 'Youtube URL');
    $(url).attr('id', 'youtube-url');

    var mins = document.createElement('select');
    $(mins).attr('id', 'mins');
    for (var i = 0; i < 10; i++) {
      var value = i;
      var text = i + ' mins';
      var option = document.createElement('option');
      $(option).attr('value', value);
      $(option).html(text);
      $(mins).append(option);
    }

    var secs = document.createElement('select');
    $(secs).attr('id', 'secs');
    for (i = 0; i < 50; i+=10) {
      value = i;
      text = i + ' secs';
      option = document.createElement('option');
      $(option).attr('value', value);
      $(option).html(text);
      $(secs).append(option);
    }

    var button = document.createElement('button');
    $(button).attr('type', 'submit');
    $(button).html('Submit');
    $(button).attr('id', 'submit');

    if (!userInputs){
      $(form).css('display', 'none');
    }

    $(form).append([textarea, url, mins, secs, button]);


    return form;
  },

  this.createPlayButton = function createPlayButton(){
    var playButton = document.createElement('button');
    $(playButton).html('play').attr('class', 'play');
    $(playButton).attr('id', 'play');
    return playButton;
  },

  this.makePlayButtonListen = function makePlayButtonListen(){
    $('#play').on('click', this.playButtonCallback.bind(this));
  },

  this.playButtonCallback = function playButtonCallback(){
    this.startCountDown();
    this.currentCharacterIndex = 0;
    setInterval(this.checkLinePosition.bind(this), 500);
    $('#play').on('click', function(){
      //do nothing
    });
  },

  this.startCountDown = function startCountDown(){
    var h2 = document.createElement('h2');
    $(h2).html(this.time);
    $(h2).attr('class', 'count-down');
    $('#game').prepend(h2);
    this.countDown();
  },

  this.countDown = function countDown(){
    setInterval(this.countDownInterval.bind(this), 1000);
  },

  this.countDownInterval = function countDownInterval(){
    $('.count-down').html(--this.time);
    if (this.time === 0) {
      clearInterval(this.countDown);
      $('.count-down').remove();
      this.displayNewLine();
      $('video').get(0).play();
    }
  },

  this.makeSubmitListen = function makeSubmitListen (){
    $('#user-form').on('submit', this.submitCallback.bind(this));
  },

  this.submitCallback = function submitCallback(e){
    e.preventDefault();
    this.getLyrics.bind(this)();
    this.parseLyrics.bind(this)();
    this.createLyricSpans.bind(this)();
    this.getDuration.bind(this)();
    this.handleAudio.bind(this)();
  },

  this.getLyrics = function getLyrics() {
    this.userLyricsHtml = $('#user-lyrics-html').val();
  },

  this.parseLyrics = function parseLyrics(){

    console.log(this);

    function makeLyricsAString(){
      var div = document.createElement('div');
      $(div).html(this.userLyricsHtml);
      this.lyricsString = div.textContent;
      console.log(this);
    }
    makeLyricsAString.bind(this)();

    function splitLinesIntoArrayElements(){
      this.linesArray = [];
      var HtmlLinesArray = this.userLyricsHtml.split('<br>');
      for (var i = 0; i < HtmlLinesArray.length; i++) {
        var div = document.createElement('div');
        div.innerHTML = HtmlLinesArray[i];
        var text = div.textContent;
        this.linesArray.push(text);
      }
    }
    if (userInputs){
      splitLinesIntoArrayElements.bind(this)();
    }

    function insertChoruses(){
      // //find chorus
      // var chorusStart = this.linesArray.indexOf('[Chorus]') + 1;
      // var chorusEnd = this.linesArray.indexOf('[Verse 1]') -1;
      //
      // //insert choruses after required x1 - x5 etc
      // for (var repeat = 0; repeat <= 10; repeat++) {
      //   var index = '[Chorus ' + repeat + 'x]';
      //   if (repeat === 0){
      //     index = '[Chorus]';
      //     console.log(index);
      //   }
      //   var chorusInsert = this.linesArray.indexOf(index) +1;
      //   //insert chorus
      //   console.log(chorusInsert);
      //   if (chorusInsert > 0){
      //     for (var j = 0; j <= repeat; j++) {
      //       for (var i = 0; i <= (chorusEnd-chorusStart); i++) {
      //         this.linesArray.splice(chorusInsert, 0, this.linesArray[chorusEnd - i]);
      //       }
      //     }
      //   }
      // }
    }
    insertChoruses.bind(this)();

    function removeEnters(){
      //remove enter (ascii 10)
      for (var i = 0; i < this.linesArray.length; i++) {
        for (var j = 0; j < this.linesArray[i].length; j++) {
          var index = this.linesArray[i][j].indexOf(String.fromCharCode(10));
          if (index > -1) {
            this.linesArray[i] = '';
          }
        }
      }
    }
    removeEnters.bind(this)();

    function removeUnwantedStrings(){
      for (var j = 0; j < 100; j++) {
        for (var i = 0; i < this.stringsToRemove.length; i++) {
          var index = this.linesArray.indexOf(this.stringsToRemove[i]);
          if (index > -1) {
            this.linesArray.splice(index, 1);
          }
        }
      }
    }
    removeUnwantedStrings.bind(this)();

  },

  this.createLyricSpans = function createLyricSpans(){
    //creating array of line divs elements this.function create spans and line divs
    for (var i = 0; i < this.linesArray.length; i++) {
      var line = this.linesArray[i];
      var lineDiv = document.createElement('div');
      $(lineDiv).addClass('line' + i);
      var lineTesting = [];
      for (var j = 0; j < line.length; j++) {
        var span = document.createElement('span');
        span.className = this.currentCharacterOnLineIndex;
        this.currentCharacterOnLineIndex += 1;
        $(span).html(line[j]);
        // this.paragraphyHtml.push(span);
        // this.paragraphyTesting.push(span);
        lineTesting.push(span);
        $(lineDiv).append(span);
      }
      // var lineBreak = document.createElement('br');
      // this.paragraphyHtml.push(lineBreak);
      // this.$linesContainer.append(lineDiv);
      this.lineDivs.push(lineDiv);
      this.lineTesting.push(lineTesting);
      this.currentCharacterOnLineIndex = 0;
    }
  },

  this.getDuration = function getDuration(){
    if (userInputs){
      var mins = $('#mins').val();
      var secs = $('#secs').val();
    } else {
      mins = this.mins;
      secs = this.secs;
    }
    this.songDuration = (mins*60000) + (secs*1000);
  },

  this.handleAudio = function handleAudio(){
    var video = document.createElement('video');
    $(video).attr('controls', 'true');
    var source = document.createElement('source');
    $(source).attr('id', 'song-source');
    if (userInputs){
      $(source).attr('src', $('#youtube-url').val());
    } else {
      $(source).attr('src', this.youtubeUrl);
    }
    $(source).attr('type', 'video/mp4');
    $(video).append(source);
    $('#game').append(video);
    this.audioStuff();
  },

  this.displayNewLine = function displayNewLine(){
    this.numberOfLinesOnScreen += 1;
    $('.lyrics-container').prepend(this.lineDivs[this.newLineIndex]);
    this.linesOnScreen.unshift(this.lineDivs[this.newLineIndex]);
    this.currentCharacterIndexes.unshift(0);

    //potential for animate function when llineDivs vs LineTesting resolved
    $(this.lineDivs[this.newLineIndex]).animate({
      top: this.height
    }, this.animationDuration, 'linear' );
  },

  this.checkLinePosition = function checkLinePosition(){
    var newLine = this.lineDivs[this.newLineIndex];
    var currentLine = this.lineDivs[this.currentLineIndex];
    var top = this.height/(((this.linesArray.length)*this.animationDuration)/this.songDuration);

    //should new line be sent out
    var pix = parseInt($(newLine).attr('style').split(' ')[1].split('p')[0]);
    if(pix > top){
      this.newLineIndex += 1;
      this.displayNewLine();
    }

    //should old line be removed
    pix = parseInt($(currentLine).attr('style').split(' ')[1].split('p')[0]);
    if (pix === 300){
      $(this.lineDivs[this.currentLineIndex]).remove();
      this.linesOnScreen.pop();
      this.currentCharacterIndexes.pop();
      this.currentLineIndex += 1;
      this.numberOfLinesOnScreen -= 1;
    }
  },

  this.makeKeysListen = function makeKeysListen(){
    $(window).on('keypress', this.keyCallback.bind(this));
  },

  this.keyCallback = function keyCallback(e){
    this.updateAccuracy();
    this.testIfCorrectKey(e);
  },

  this.testIfCorrectKey = function testIfCorrectKey(e){
    this.keysPressed += 1;
    for (var i = 0; i < 10; i++) {
      var className = this.linesOnScreen[i].className;
      var selector = '.' + className + ' span:nth-child(' + (this.currentCharacterIndexes[i] + 1) +')';
      if ($(selector)[0].innerHTML === String.fromCharCode(e.which)){
        var currentSpan = $(selector)[0];
        $(currentSpan).addClass('correct');
        this.currentCharacterIndexes[i] += 1;
        this.hit += 1;
      }
    }
  },

  this.updateAccuracy = function updateAccuracy(){
    $('#hit').html('hit: ' + this.hit);
    $('#missed').html('missed: ' + (this.keysPressed - this.hit));
    $('#accuracy').html('accuracy: ' + Math.round((this.hit/this.keysPressed)*100) + '%');
  },

  this.audioStuff = function audioStuff(){
    var videos = document.querySelectorAll('video');
    for (var i = 0, l = videos.length; i < l; i++) {
      var video = videos[i];
      var src = video.src || (function () {
        var sources = video.querySelectorAll('source');
        for (var j = 0, sl = sources.length; j < sl; j++) {
          var source = sources[j];
          var type = source.type;
          var isMp4 = type.indexOf('mp4') != -1;
          if (isMp4) return source.src;
        }
        return null;
      })();
      if (src) {
        var isYoutube = src && src.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);
        if (isYoutube) {
          var id = isYoutube[1].match(/watch\?v=|[\w\W]+/gi);
          id = (id.length > 1) ? id.splice(1) : id;
          id = id.toString();
          var mp4url = 'http://www.youtubeinmp4.com/redirect.php?video=';
          video.src = mp4url + id;
        }
      }
    }
  };

}


var Redbone = new Game('Chilled', false, 'https://www.youtube.com/watch?v=Kp7eSUU9oy8', ['Daylight',
  'I wake up feeling like you won\'t play right','I used to know, but now that shit don\'t feel right','It made me put away my pride','So long','You made a nigga wait for some, so long','You make it hard for a boy like that to know wrong','I\'m wishing I could make this mine, oh','[Pre-Chorus]','If you want it, yeah','You can have it, oh, oh, oh','If you need it, oooh','We can make it, oh','If you want it','You can have it','[Chorus]','But stay woke','Niggas creepin','They gon\' find you','Gon\' catch you sleepin\' (Oooh)','Now stay woke','Niggas creepin','Now don\'t you close your eyes','Too late','You wanna make it right, but now it\'s too late','My peanut butter chocolate cake with Kool-Aid','I\'m trying not to waste my time','[Pre-Chorus]','If you want it, oh','You can have it, you can have it','If you need it','You better believe in something','We can make it','If you want it','You can have it, aaaaah','[Chorus]','But stay woke','Niggas creepin\'','They gon\' find you','Gon\' catch you sleepin\'','Put your hands up on me','Now stay woke','Niggas creepin\'','Now, don\'t you close your eyes','But stay woke','Niggas creepin\'','They gon\' find you','Gon\' catch you sleepin\', ooh','Now stay woke','Niggas creepin\'','Now, don\'t you close your eyes','Baby get so scandalous, oh','How\'d it get so scandalous?','Oh, oh, baby, you...','How\'d it get...','How\'d it get so scandalous?','Ooh, we get so scandalous','But stay woke','But stay woke'], 5, 27);

var Lyrics = new Game('Impossible', false, 'https://www.youtube.com/watch?v=q5jGFujaJ40', [
  '[Intro: Wiley & Bushkin]',
  'Come off the stage! Move!',
  'They don\'t want to hear you! They don\'t want to hear you!',
  'What, is that what you think? Is that what you think?',
  'Oi blud, calm, calm, calm',
  'Lyrics for lyrics, calm',
  '[, Skepta]',
  'Yeah, hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  'Hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  '[Ver, Skepta]',
  'Yeah, you got murked last week',
  'Couldn\'t even get a rewind, that\'s peak',
  'Couldn\'t get out your punchlines on time',
  'Now you wanna diss me? Oh blud, what a cheek',
  'Sidewinder, you got air on the roads',
  'Eskimo Dance, you was spitting off-beat',
  'Lord of the Mics, you was spitting that heat',
  'But right now, your bars ain\'t on fleek',
  'You don\'t wanna clash me, you will get murked',
  'Bury MCs six feet in the dirt',
  'I know you saw the police outside',
  'You saw the blood on Devilman\'s shirt',
  'Got rude, that didn\'t work',
  'And your girl looks like she don\'t work',
  'Mental',
  'Man wouldn\'t beat that even if I was burse',
  '[, Skepta]',
  'Yeah, hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  'Hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  '[Ver, Skepta]',
  'Them man are fake, them man are sus',
  'I\'m the boss these pagans wanna touch',
  'I\'m the kind of boss that the opps gotta rush',
  'Cause I make it ring something like bells on the bus',
  '1 on 1, fair and square, man are fucked',
  'Swinging out my sword, swinging out my nunchuks',
  'Running out of corn? Man\'ll get a gun buck',
  'Tell a pussyhole look sharp, fix up',
  'Where you from? Huh, what\'s wrong?',
  'What\'s going on? Why you got your screwface on?',
  'Dead that, forget that',
  'Diss track? Nobody wanna hear that song',
  'Better get your thinking hats on',
  'You don\'t wanna diss me, that\'s long',
  'Cause I\'m a don, lyrically gone',
  'You want to clash but you\'re gonna get banged on',
  '[, Skepta]',
  'Yeah, hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  'Hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  '[Ver, Novelist]',
  'Yo, I\'m a king, lyrically ming',
  'You want to clash but you\'re gonna get tucked in',
  'Drew for the buck ting when I bucked him',
  'And in the jawside\'s right where I bucked him',
  'Don\'t really care if you go to gym',
  'Get put down by the lead like drawing',
  'To kick your door in, anybody snoring',
  'When I bore in\'s gonna get a full face',
  'Full of piss you\'re in, deep shit you\'re in',
  'N-O-V-D-D-D that you\'re warring',
  'Not gonna be me that you\'re boring',
  'I\'m gonna jack manaman, take your rings',
  'And all of your bling, Lewisham king',
  'It\'s not a ting to draw the ting if you wanna swing',
  'But if you get jooked, don\'t sing',
  'Not a long ting to do the hype ting',
  '[, Skepta]',
  'Yeah, hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm',
  'Hear me on the radio, wah gwan?',
  'See me on the TV, hi mum',
  'Murk MCs when the mic\'s in my palm',
  'Lyrics for lyrics, calm'], 2, 27);


var Import = new Game('Import', true);
