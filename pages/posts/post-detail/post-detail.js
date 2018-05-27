var postsData = require("../../../data/posts-data.js");
var app = getApp();
Page({
    data: {
       "isPlayingMusic" : false 
    },
    onLoad: function (option) {
       var globalData = app.globalData;
       var postId = option.id;
       this.data.currentPostId = postId;
       var postData = postsData.postList[postId];
       this.setData({
         postData: postData
       })

       // 在onload 加载的时候读取所有的缓存状态
       var postsCollected = wx.getStorageSync("postsCollected");
       
       // ru如果有这个缓存
       if (postsCollected){
           var postCollected = postsCollected[postId];
         
           this.setData({
              collected: postCollected
           })
       }else{
         // 如果没有这个缓存 
          var postsCollected = {};
          postsCollected[postId] = false ;
          wx.setStorageSync("posts_collected", postsCollected)
       }
       

       // 这个判断 当前播放的音乐和当前 id 一样的时候  并且 音乐是播放的 状态 
       if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId == postId ){
            // 条件判断为真的时候才执行下面
            // 所有上面的条件是真 才表示音乐在播放
            this.setData({
              isPlayingMusic : true
            })
       }
       // 监听音乐播放
       this.setMusicMonitor();
    },
    setMusicMonitor: function () {
        var that = this;
        wx.onBackgroundAudioPlay(function () {
          that.setData({
            isPlayingMusic: true
          })
          app.globalData.g_isPlayingMusic = true ;
          app.globalData.g_currentMusicPostId = that.data.currentPostId
        })

        wx.onBackgroundAudioPause(function () {
          that.setData({
            isPlayingMusic: false
          })
          app.globalData.g_isPlayingMusic = false ;
          app.globalData.g_currentMusicPostId = null;
        })

        wx.onBackgroundAudioStop(function () {
          that.setData({
            isPlayingMusic: false
          })
          app.globalData.g_isPlayingMusic = false;
          app.globalData.g_currentMusicPostId = null;
        })



    },
    onColletionTap:function(event){
      // 获取缓存
      var postsCollected = wx.getStorageSync("posts_collected");
      console.log(postsCollected)
      // 得到当前的 这个 缓存
      var postCollected = postsCollected[this.data.currentPostId];

      postCollected = !postCollected;
      // 更新当前id 是否被收藏
      postsCollected[this.data.currentPostId] = postCollected;
      //对缓存进行更新
      wx.setStorageSync("posts_collected", postsCollected);
      this.setData({
           collected: postCollected
      });

      wx.showToast({
        title: postCollected ? "收藏成功" : "取消收藏"
      })
    },
    onShareTap:function(event){
      var itemList = [
          "分享到威信好友",
          "分享到朋友圈",
          "分享到QQ",
          "分享到微博"
      ]
        wx.showActionSheet({
          itemList:itemList,
          itemColor:"#000000",
          success:function(res){
              wx.showModal({
                title: '用户' + itemList[res.tapIndex],
                content:"用户是否取消？" + res.cancel +"暂时无法分享"
              })

          }
        })
    },
    onMusicTap:function(){
       var isPlayingMusic = this.data.isPlayingMusic ;
       if (isPlayingMusic){
          wx.pauseBackgroundAudio();
          this.setData({
            isPlayingMusic:false
          })
       }else{
         wx.playBackgroundAudio({
           dataUrl: postsData.postList[this.data.currentPostId].music.url,
           title: postsData.postList[this.data.currentPostId].music.title,
           coverImgUrl: postsData.postList[this.data.currentPostId].music.coverImg
         });
         this.setData({
           isPlayingMusic: true
         })
       }

      
    }
})