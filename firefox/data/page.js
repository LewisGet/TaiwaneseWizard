/*------
台語兒(Taiwanese Wizard) for Firefox by BaconBao (http://baconbao.blogspot.com)
------*/

self.port.on("tmpText", function(selectionText){

	/*--- Version Code ---*/
	var versionCode = '1.01';
	$('#version').text(versionCode);

	/*--- Page Start ---*/
	if(selectionText=='0') selectionText='０';
	if(sessionStorage["mainText"]==null){
		sessionStorage["mainText"] = selectionText;
	}
	var text = sessionStorage["mainText"];
	$('#text2say').text(text);

	/*--- Title Change ---*/
	if(text.length > 10){
		$('title').text('台語兒：「'+text.substr(0, 10)+'...」');
	}else{
		$('title').text('台語兒：「'+text+'」');
	}
	
	/*--- Play voice --*/
	stratTTS_first(text);
	
	/*--- Logo Follow Mouse ---*/
	var logoPos = $("#logo>img").position();
	var logoWidthHalf = $("#logo>img").width() / 2;
	var logoHeightHalf = $("#logo>img").height() / 2;
	var soucePoint = {x:(logoPos.left+logoWidthHalf), y:(logoPos.top+logoHeightHalf)};
	$(document).mousemove(function(e){
		var mouzPoint = {x:e.pageX, y:e.pageY};
		var distX = mouzPoint.x - soucePoint.x;
		var distY = mouzPoint.y - soucePoint.y;
		var degX = parseInt(distY/1000*45, 10);
		var degY = parseInt(-1*distX/2000*45, 10);
		$("#logo").css('-moz-transform', 'rotateY('+degY+'deg) rotateX('+degX+'deg)');
	});

	/*--- Logo Click to Say ---*/
	$('#logo').click(function(){
		clearInterval(faceInit);
		var audioElement = $('#ttsplayer')[0];
		audioElement.play();
	});

	/*--- Audio API ---*/
	$('#ttsplayer').on('playing', function() {
	   $('#face').text('^ 0 ^');
	});
	$('#ttsplayer').on('ended', function() {
		$('#face').text('^ _ ^');
	    faceInit = setInterval(faceInitFunc, 5000);
	});

});

function set2default(){
	localStorage["setting-speaker"] = 'TW_LIT_AKoan';
	localStorage["setting-volume"] = 100;
	localStorage["setting-speed"] = -2;
	localStorage["setting-pitchlevel"] = 5;
	localStorage["setting-pitchscale"] = 13;
}

function faceInitFunc(){		
	setTimeout(function(){$('#face').text('> _ <');},10);
	setTimeout(function(){$('#face').text('^ _ ^');},800);
}

function stratTTS_first(text){
	if(localStorage["setting-volume"]==null){
		set2default();
	}
	$('#face').html('<i class="icon loading" style="margin-left:15px;"></i>');
	var speaker = localStorage["setting-speaker"];
	var volume = localStorage["setting-volume"];
	var speed = localStorage["setting-speed"];
	var pitchLevel = localStorage["setting-pitchlevel"];
	var pitchSign = 0;
	var pitchScale = localStorage["setting-pitchscale"];
	var cache = new Date().getTime();
	var key = "81*26*3A*3C1*26*3A*2A*14*2Aefgefg";
	$.ajax({
		url: "http://tts.itri.org.tw/php/webtts.php?t=4&f=wav&w="+text+"&m="+speaker+"&v="+volume+"&s="+speed+"&pl="+pitchLevel+"&psi="+pitchSign+"&psc="+pitchScale+"&idx="+cache+"&k="+key,
		type: 'GET',
		dataType: 'text',
		jsonp: false,
		success: function(data){
			var tmpTextNum1 = data.indexOf('resultConvertID');
			var tmpTextNum2 = data.indexOf("=", tmpTextNum1);
			var tmpTextNum3 = data.indexOf(";", tmpTextNum2);
			var convertId = data.substring(tmpTextNum2+2, tmpTextNum3-1);
			var times = 0;
			var startTTS_second;
			startTTS_second = setInterval(function(){
				$.ajax({
					url: "http://tts.itri.org.tw/php/webtts.php?t=3&i="+convertId+"&idx="+cache+"&k="+key,
					type: 'GET',
					dataType: 'text',
					jsonp: false,
					success: function(data){
						var tmpDataNum1 = data.indexOf('resultUrl');
						var tmpDataNum2 = data.indexOf("=", tmpDataNum1);
						var tmpDataNum3 = data.indexOf(";", tmpDataNum2);
						var resultUrl = data.substring(tmpDataNum2+2, tmpDataNum3-1);
						times++;
                        if(times == 60){
                        	clearInterval(startTTS_second);
                        	$('#face').text('x _ x');
                        	alert('抱歉，此語句台語兒不會說...');
			                $.ajax({
								url: "http://tts.itri.org.tw/php/whenerrorsendmail.php?cache="+new Date().getTime(),
								type: 'GET',
								dataType: 'text',
								jsonp: false,
								success: function(data){}
							});         
                        }
						if(resultUrl!="") { 
							clearInterval(startTTS_second);
							var audioElement = $('#ttsplayer')[0];
							audioElement.setAttribute('src', resultUrl);
							audioElement.play();
						};
					}
				});
			}, 1000);
		},
		error: function(xhr){
			alert(xhr.status);
			$('#face').text('x _ x');
			alert('無法連接，可能是您的網路不通或是本服務維護中。');
		}
	});
}