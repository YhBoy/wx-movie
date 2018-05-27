var util = require("../../utils/util.js")
var app = getApp();
Page({

  data: {
     inTheaters :{},
     comingSoon : {},
     top250 : {},
     searchResult: {},
     containerShow:true,
     searchPannelShow:false
     // 前面三个必须有  否则会出现异步报错
  },

  onLoad: function (event) {
    var inTheatersUrl = app.globalData.doubanBase+"/v2/movie/in_theaters"+"?start=0&count=3";
    var comingSoonUrl = app.globalData.doubanBase + "/v2/movie/coming_soon" + "?start=0&count=3";
    var top250Url = app.globalData.doubanBase + "/v2/movie/top250" + "?start=0&count=3";

    this.getMovieListData(inTheatersUrl,"inTheaters","正在热映");
    this.getMovieListData(comingSoonUrl,"comingSoon","即将上映");
    this.getMovieListData(top250Url,"top250","豆瓣top250");

   
  },
  // 封装的请求数据的函数 
  getMovieListData: function (url, settedKey, categoryTitle){
    var that = this ;
    wx.request({
      url: url,
      method: "get",
      header: { 'Content-Type': 'xml' },
      success: function (res) {
        console.log(res)
        that.processDoubanData(res.data, settedKey, categoryTitle)
      },
      fail:function(error){
        console.log(error)
      }
    })  
  },
  // 通过函数把数据传给 各个组件
  processDoubanData: function (moviesDouban, settedKey, categoryTitle){
        var movies = [];
        for (var idx in moviesDouban.subjects ){
             // idx 打印出来是 0 1 2   索引值
          var subject = moviesDouban.subjects[idx];
          var title = subject.title;
          if( title.length >= 6 ){
              title = title.substring(0,6) + "...";
          }
          var temp = {
            // zhe 里的stars数组的传入星星组件模版 [1,1,1,1,0]
            stars: util.convertToStarsArray(subject.rating.stars),
            "title" : title,
            "average": subject.rating.average,
            "coverageUrl": subject.images.large,
            "movieId" : subject.id
          };
          movies.push(temp);
        }
        var readyData = {} ;
        readyData[settedKey] = {
          categoryTitle: categoryTitle,
          movies : movies
        };
        console.log(readyData)
        this.setData(readyData)
       
  },

  // 点击更多
  onMoreTap:function(event){
      var category = event.currentTarget.dataset.category

      wx.navigateTo({
        url: 'more-movie/more-movie?category=' + category
      })
  },
  onBindFocus:function(){
    this.setData({
      containerShow : false,
      searchPannelShow : true
    })
  },
  onBindChange:function(event){
      var text = event.detail.value;
      var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q="+ text;
      this.getMovieListData(searchUrl,"searchResult","");
  },
  onCancelImgTap:function(){
    this.setData({
      containerShow: true,
      searchPannelShow: false,
      searchResult : {}
    })
  },
  onMovieTap:function(event){
    var movieId = event.currentTarget.dataset.movieid;
     wx.navigateTo({
       url: 'movie-detail/movie-detail?id=' + movieId
     })
  }
})