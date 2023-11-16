var AppConfig = {

	apiUrl: "http://dx.jimi5588.com:8092",// 接口地址
	//boshUrl : "http://mm.jimi5588.com:5280",
	boshUrl: "ws://dx.jimi5588.com:5290/websocket/",// http://+（XMPP主机IP或域名）+（:5280）
	uploadServer: "http://dx.jimi5588.com:8088/",
	fileServer: "http://dx.jimi5588.com:8089/",
	jitsiDomain: "/",
	apiKey: "",
	companyId: "5cd2fdfd0c03d03c19a109c7", //客服模块公司id
	departmentId: "5cd2fdfd0c03d03c19a109c9", //客服部门id
	isOpenReceipt: 1,
	isOpenSMSCode: 0,  //是否开短信验证码
	registerInviteCode: 0, //注册邀请码  0：关闭 1:一码一用(注册型邀请码)  2：一码多用（推广型邀请码）
	regeditPhoneOrName: 0// 注册方式 0:手机号注册，1：用户名注册
};


var myData = {
	isReadDel: 0,
	isAutoOpenCustomer: 1,  //是否自动开启客服模式
	resource: "web",//多点登陆 用到的 设备标识
	jid: null,
	userId: null,
	telephone: null,
	password: null,
	access_token: null,
	loginResult: null,
	user: null,
	nickname: null,

	locateParams: null,
	keepalive: 70,//xmpp 心跳间隔
	charArray: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
	isShowGroupMsgReadNum: false//是否显示群组消息已读人数，false：不显示 true:显示 默认不显示
};


//日志打印
function tigLog(obj){
	//log 打印
 	console.log("tigLog "+obj);
}


var ivKey=[1,2,3,4,5,6,7,8];

function getStrFromBytes (arr) {
    var r = "";
    for(var i=0;i<arr.length;i++){
        r += String.fromCharCode(arr[i]);
    }
    //console.log(r);
    return r;
}
var iv=getStrFromBytes(ivKey);

var myFn = {
	invoke: function (obj) {
		jQuery.support.cors = true;
		var type = "POST";
		var async = false;
		if (obj.type) {
			type = obj.type;
		}
		if (obj.async) {
			async = obj.async;
		}
		if (!obj.data.secret) {
			obj.data = WEBIM.createCommApiSecret(obj.data);
		}
		//$.extend(params, obj);
		var params = {
			type: type,
			async: async,
			url: AppConfig.apiUrl +obj.url,
			data: obj.data,
			dataType: 'json',
			success: function (result) {
				if (1030101 === result.resultCode) {
					//缺少访问令牌
					console.log("===> " + obj.url + " >> " + result.resultMsg);
					if (result.resultMsg) {
						ownAlert(3, result.resultMsg);
					}
					/*setTimeout(function(){
                         window.location.href = "login.html";
                    },1000);*/

				} else if (1030102 === result.resultCode) {
					//访问令牌过期
					console.log("===> " + obj.url + " >> " + result.resultMsg);
					if (result.resultMsg) {
						ownAlert(3, result.resultMsg);
					}
					setTimeout(function () {
						window.location.href = "login.html";
					}, 1000);

				} else if (1010101 === result.resultCode) {
					console.log("===> " + obj.url + " >> " + result.resultMsg);
				} else if (1040307 === result.resultCode || 1040308 === result.resultCode || 1040309 === result.resultCode) {

				} else if (1 !== result.resultCode && myFn.notNull(result.resultMsg)) {
					if (false === obj.isShowAlert) {
						return;
					}
					if (result.resultMsg) {
						ownAlert(3, result.resultMsg);
					}
					if (obj.fail) {
						obj.fail();
					}
					return;
				} else if (myFn.notNull(result.resultMsg)) {
					if (obj.isShowAlert) {
						ownAlert(3, result.resultMsg);
					}
				}
				obj.success(result);


			},
			error: function (result) {
				if (false === obj.isShowAlert) {
					return;
				}
				if (result.resultMsg)
					ownAlert(2, result.resultMsg);
				// obj.error(result);
			},
			complete: function () {
			}
		};

		if (myFn.isNil(params.data["access_token"])) {
			params.data["access_token"] = myData.access_token;
		}
		$.ajax(params);

	},
	/** 调用接口通用方法,该方法的弹框提示等ui部分使用layui  */
	lay_invoke: function (obj) {
		jQuery.support.cors = true;
		layer.load(1); //显示等待框
		var params = {
			type: (myFn.isNil(obj.type) ? "POST" : obj.type),
			url: obj.url,
			data: obj.data,
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
			dataType: 'JSON',
			success: function (result) {
				layer.closeAll('loading');

				if (1 === result.resultCode) {
					if (obj.successMsg != false) {
						layer.msg(obj.successMsg, {icon: 1});
					}
					obj.successCb(result);//执行成功的回调函数					

				} else if (1030101 === result.resultCode) {
					//缺少访问令牌
					layer.msg(result.resultMsg, {icon: 3});
					/*setTimeout(function(){
                         window.location.href = "login.html";
                    },1000);*/

				} else if (1030102 === result.resultCode) {
					//访问令牌过期
					layer.msg(result.resultMsg, {icon: 3});
					setTimeout(function () {
						window.location.href = "login.html";
					}, 1000);

				} else if (-1 === result.resultCode) {
					if (result.resultMsg) {
						layer.msg(result.resultMsg, {icon: 3});
					}

				} else {
					if (!myFn.isNil(result.resultMsg)) {
						layer.msg(result.resultMsg, {icon: 2});
					}

					//obj.errorCb(result);
				}
				return;

			},
			error: function (result) {
				layer.closeAll('loading');
				if (!myFn.isNil(result.resultMsg)) {
					layer.msg(result.resultMsg, {icon: 2});
				} else {
					layer.msg(obj.errorMsg, {icon: 2});
				}
				obj.errorCb(result);//执行失败的回调函数
				return;
			},
			complete: function (result) {
				layer.closeAll('loading');
			}
		};
		params.url = AppConfig.apiUrl + params.url;
		params.data["access_token"] = myData.access_token;
		$.ajax(params);
	},
	getAvatarUrl: function (userId, update) {
		if (myFn.isNil(userId)) {
			userId = myData.userId;
		}
		if (10000 === userId) {
			return "img/im_10000.png";
		}
		var imgUrl = AppConfig.avatarBase + (parseInt(userId) % 10000) + "/" + userId + ".jpg";
		if (1 === update) {
			imgUrl += "?x=" + Math.random() * 10;
		}
		return imgUrl;
	},

	/*是否为阅后即焚消息*/
	isReadDelMsg: function (msg) {
		try {
			if (!msg.isReadDel) {
				return false;
			}
			return ("true" == msg.isReadDel || 1 == msg.isReadDel);
		} catch (e) {
			//console.log(e.name + ": " + e.message);
			return false;
		}

	},
	isContains: function (str, substr) {
		return str.indexOf(substr) >= 0;
	},
	isNil: function (s) {
		return undefined == s || "undefined" == s || null == s || $.trim(s) == "" || $.trim(s) == "null" || NaN == s;
	},
	notNull: function (s) {
		return !this.isNil(s);
	},
	//截取指定长度的字符串 text:文本  length ：长度
	getText: function (text, length) {
		if (myFn.isNil(text)) {
			return " ";
		}
		text = text.replace(/<br\/>/g, '');
		if (!length) {
			length = 15;
		}
		if (text.length <= length) {
			return text;
		}
		text = text.substring(0, length) + "...";
		return text;

	},
	strToJson: function (str) {
		return eval("(" + str + ")");
	},
	setCookie: function (key, value) {
		$.cookie(key, JSON.stringify(value));
	},
	getCookie: function (key) {
		var value = $.cookie(key);
		return myFn.strToJson(value);
	},
	removeCookie: function (key) {
		return $.removeCookie(key);
	},
	switchEncrypt: function (key) {
		if (key === 1) {
			WEBIM.setEncrypt(true);
		} else {
			WEBIM.setEncrypt(false);
		}
		/*var isEncrypt = myData.isEncrypt;  //是否为加密  false:不是  true:是
			myData.isEncrypt=!isEncrypt;
			ownAlert(3,myData.isEncrypt);*/

	},
	switchCustomer: function (key) {
		if (key === 1) {
			myData.openService = 1;
		} else {
			myData.openService = 0;
		}
	},
	randomUUID: function () {
		var chars = myData.charArray, uuid = new Array(36), rnd = 0, r;
		for (var i = 0; i < 36; i++) {
			if (i === 8 || i === 13 || i === 18 || i === 23) {
				uuid[i] = '-';
			} else if (i === 14) {
				uuid[i] = '4';
			} else {
				if (rnd <= 0x02) {
					rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				}
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		return uuid.join('').replace(/-/gm, '').toLowerCase();
	},
	getTimeSecond: function () {
		return Math.round(new Date().getTime() / 1000);
	},
	toDateTime: function (timestamp) {
		return (new Date(timestamp * 1000)).format("yyyy-MM-dd hh:mm");
	},
	toDate: function (timestamp) {
		return (new Date(timestamp * 1000)).format("yyyy-MM-dd");
	},
	getAudioPlayer: function (passedOptions) {
		var playerpath = "/js/";

		// passable options
		var options = {
			"filepath": "", // path to MP3 file (default: current directory)
			"backcolor": "", // background color
			"forecolor": "ffffff", // foreground color (buttons)
			"width": "25", // width of player
			"repeat": "no", // repeat mp3?
			"volume": "50", // mp3 volume (0-100)
			"autoplay": "false", // play immediately on page load?
			"showdownload": "true", // show download button in player
			"showfilename": "true" // show .mp3 filename after player
		};

		if (passedOptions) {
			jQuery.extend(options, passedOptions);
		}
		var filename = options.filepath;
		var mp3html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';
		mp3html += 'width="' + options.width + '" height="20" ';
		mp3html += 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab">';
		mp3html += '<param name="movie" value="' + playerpath + 'singlemp3player.swf?';
		mp3html += 'showDownload=' + options.showdownload + '&file=' + filename + '&autoStart=' + options.autoplay;
		mp3html += '&backColor=' + options.backcolor + '&frontColor=' + options.forecolor;
		mp3html += '&repeatPlay=' + options.repeat + '&songVolume=' + options.volume + '" />';
		mp3html += '<param name="wmode" value="transparent" />';
		mp3html += '<embed wmode="transparent" width="' + options.width + '" height="20" ';
		mp3html += 'src="' + playerpath + 'singlemp3player.swf?'
		mp3html += 'showDownload=' + options.showdownload + '&file=' + filename + '&autoStart=' + options.autoplay;
		mp3html += '&backColor=' + options.backcolor + '&frontColor=' + options.forecolor;
		mp3html += '&repeatPlay=' + options.repeat + '&songVolume=' + options.volume + '" ';
		mp3html += 'type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
		mp3html += '</object>';
		console.log(mp3html);
		return mp3html;
	},

	parseContent: function (content) {
		var emojlKeys = new Array();
		if (myFn.isNil(content)) {
			return content;
		}
		var s = content;
		var fromIndex = 0;
		while (fromIndex != -1) {
			fromIndex = s.indexOf("[", fromIndex);
			if (fromIndex === -1) {
				break;
			} else {
				var stop = s.indexOf("]", fromIndex);
				if (stop === -1) {
					break;
				} else {
					var emojlKey = s.substring(fromIndex, stop + 1);
					emojlKeys.push(emojlKey);
					fromIndex = fromIndex + 1;
				}
			}
		}
		//表情
		if (emojlKeys.length != 0) {
			var key = null;
			var emojl = null;
			for (var i = 0; i < emojlKeys.length; i++) {
				key = emojlKeys[i];
				emojl = _emojl[key];
				if (!myFn.isNil(emojl)) {
					s = s.replace(key, "<img src='" + emojl + "' width='25' height='25' />");
				}

			}
			return s;
		}

		content = Utils.hrefEncode(content);

		return content;

	},
	parseFileSize: function (value) {
		if (null === value || value === '') {
			return "0 B";
		}
		var unitArr = new Array("B", "KB", "MB", "GB");
		var index = 0;
		var srcsize = parseFloat(value);
		index = Math.floor(Math.log(srcsize) / Math.log(1024));
		var size = srcsize / Math.pow(1024, index);
		size = size.toFixed(2);//保留的小数位数
		return size + unitArr[index];
	},
	getAvatar: function () {
		$("#avatarForm #avatar").click();
		// document.getElementsById["photo"].click();
	},
	getPicture: function () {
		$("#uploadFileModal #myfile").click();
	},
	getFile: function () {

	},
	deleteReadDelMsg: function (messageId) { //删除缓存未读消息中的某条阅后即焚消息
		var unReadMsg = DataMap.unReadMsg[ConversationManager.fromUserId]; //获取缓存的消息
		if (myFn.isNil(unReadMsg) || 0 === unReadMsg.length) {
			return;
		}
		for (var i = 0; i < unReadMsg.length; i++) {
			var msg = unReadMsg[i];
			if (messageId === msg.id) {
				DataMap.unReadMsg[ConversationManager.fromUserId].splice(i, 1);
			}
		}
	},


};


/**
 * 
 * @param type //type : 1 成功 2:失败 3：提示 4:询问
 * @param infoText
 * @param okCallback
 * @returns
 */
function ownAlert(type,infoText,okCallback){  //自定义的弹框  
	
	/*if(type==1)
		window.wxc.xcConfirm(infoText, window.wxc.xcConfirm.typeEnum.success,options);
	if(type==2)
		window.wxc.xcConfirm(infoText, window.wxc.xcConfirm.typeEnum.error,options);
	if(type==3)
		window.wxc.xcConfirm(infoText, window.wxc.xcConfirm.typeEnum.info,options);*/

	if(type==1)
		layer.msg(infoText, {icon: 1});

	if(type==2)
		layer.msg(infoText, {icon: 5});
	if(type==3)
		layui.layer.open({
		  title: false,
		  closeBtn: 0,
		  btnAlign: 'c',
		  skin: 'my-skin',
		  content: '<div style="text-align:center;">'+infoText+'</div>' 
		});
	if(type==4)

		layui.layer.confirm(
				'<div style="text-align:center;">'+infoText+'</div>', 
				{icon: 3, title:false, closeBtn: 0,btnAlign: 'c',skin: 'my-skin'}, 
				function(index){
				   if(okCallback)	
						 okCallback();
                   layui.layer.close(index);

			    }
		);

};


var Checkbox = {
	/*用于存储被选中的好友的userId  key:userId  value:userId 
	 用于解决checkbox翻页后上一页的选中数据无法记录的问题*/
	cheackedFriends : {}, 
	checkedNames:[],
	checkedAndCancel : function(that) {  //checkbox选中与取消选中
		// ownAlert(3,"点击选中与取消");
	    if (that.checked) {//判断是否为选中状态
	        Checkbox.checked(that);
	    } else {
	        Checkbox.cancel(that.value,that.id);
	    }
		
	},
	checked : function (that) {  //checkbox选中事件
		
		var userId=that.value;
		var showAreaId=that.id;
		if(Checkbox.cheackedFriends[userId]==userId){  //判断是否存在
			return;
		}
		Checkbox.cheackedFriends[userId] = userId; //选中后将userId 存到map中
		var nickname=$(that).attr("nickname");
		
		if(!myFn.isNil(nickname)){
			Checkbox.checkedNames[userId+"uId"]=nickname; 
			Checkbox.checkedNames.length+=1;
		}
		var imgUrl = myFn.getAvatarUrl(userId);
		var avatarHtml = "<img id='img_"+userId+"' onerror='this.src=\"img/ic_avatar.png\"'  src='" + imgUrl + "' class='roundAvatar checked_avatar' />"
		if("areadyChooseFriends"==showAreaId){
			$("#addEmployee  #"+showAreaId+"").append(avatarHtml);
		}else if ("setAdminShowArea"==showAreaId) {
			$("#setAdmin  #"+showAreaId+"").append(avatarHtml);
		}else if ("false"==showAreaId) {
			//id 为 false 则不显示已选头像 
		}else{
			$("#"+showAreaId+"").append(avatarHtml);
		}
	},
	cancel : function (userId,showAreaId) {  //checkbox取消选中事件
		delete Checkbox.cheackedFriends[userId]; //取消选中后将userId 从map中移除
		if(!myFn.isNil(Checkbox.checkedNames[userId+"uId"])){
			delete Checkbox.checkedNames[userId+"uId"];
			Checkbox.checkedNames.length-=1;
		}
		if(!myFn.isNil(showAreaId))
			$("#"+ showAreaId +" #img_"+userId+"").remove();
	},
	cleanAll:function(){
		Checkbox.cheackedFriends={};
		Checkbox.checkedNames=[];
	},
	parseData : function(){ //解析 cheackedFriends 中的数据
		if(myFn.isNil(Checkbox.cheackedFriends)){ //判断是否存在数据
			return null;
		}
		var invitees = new Array();
		for(var key in Checkbox.cheackedFriends){  //通过定义一个局部变量key遍历获取到了cheackedFriends中所有的key值  
		  
		   invitees.push(Checkbox.cheackedFriends[key]); //获取key所对应的value的值,并存入数组  
		}
		// return JSON.stringify(invitees);
		return invitees;
	}

};



