var app = getApp();
var util = require("../../../utils/util.js");
Page({
  data: {
     navigateTitle : "",
     movies : {},
     requestUrl : "",
     totalCount : 0 ,
     isEmpty : true //判断是否为第一次加载
  },

  onLoad: function (options) {
    var category = options.category;
    this.data.navigateTitle = category;
    var dataUrl = "";

    switch (category){
       
      case "正在热映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters";
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/coming_soon";
        break;
      case "top250":
        dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
        break;
    };
    this.data.requestUrl = dataUrl;

    util.http(dataUrl, this.processDoubanData);
    wx.showNavigationBarLoading()
        

  },
  processDoubanData: function (moviesDouban){
    var movies = [];
    for (var idx in moviesDouban.subjects) {
      // idx 打印出来是 0 1 2   索引值
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }
      var temp = {
        // zhe 里的stars数组的传入星星组件模版 [1,1,1,1,0]
        stars: util.convertToStarsArray(subject.rating.stars),
        "title": title,
        "average": subject.rating.average,
        "coverageUrl": subject.images.large,
        "movieId": subject.id
      };
      movies.push(temp);
    }
    var totalMovies = {};
    if( !this.data.isEmpty ){
        // 不是空  不是第一次加载
      totalMovies = this.data.movies.concat(movies);
    }else{
      // 第一次加载
      totalMovies = movies; 
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies
    })
    this.data.totalCount += 20;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onScrollLower:function(event){
    var nextUrl = this.data.requestUrl +"?start="+ this.data.totalCount + "&count=20";
    util.http(nextUrl, this.processDoubanData);
    wx.showNavigationBarLoading()
  },
  onPullDownRefresh:function(){
    var refreshUrl = this.data.requestUrl + "?start=0" + "&count=20";
    this.data.movies = {};
    this.data.isEmpty = true ;
    util.http(refreshUrl, this.processDoubanData);
    wx.showNavigationBarLoading()
  },
  onReady:function(){
      wx.setNavigationBarTitle({
        title: this.data.navigateTitle
      })
  }
})