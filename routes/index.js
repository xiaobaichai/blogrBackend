const express=require('express');
const md5 = require('md5');
const S_KEY='lasjkdfsoad8'
const router =express.Router()


// 连接数据库
const connection =require('../db/db.js')

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
  });

  //定时（3h）ping数据库，保持数据库连接状态（默认8小时不访问数据库则自动断开）
  var pingInterval =null
  clearInterval(pingInterval);
  pingInterval = setInterval(function(){
      connection.ping(function(err){
        if(err) log(err)
        console.log('pinged');
      })
  }, 3600000*3);


// 接口目录===================================================

// router.get('/',(req,res)=>{
//     res.send('hi')
// })

// router.get('/session',(req,res)=>{
//     res.setHeader('Content-Type', 'text/html')
//     res.write('<p>views: ' + req.session.views + '</p>')
//     res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//     res.end()
// })

// router.get('/sessionTest2',(req,res)=>{
//     req.session.user_nickname='randy'
//     res.send('ok')
// })

// router.get('/cookie',(req,res)=>{
//     res.cookie('testid','1234')
//     res.send('get cookie')
// })

//Nav导航条
//根据cookie请求用户信息
// router.get('/api/get_user_acount',(req,res,next)=>{
//     if(req.session.user_id) {
//         return res.json({
//             code:0,
//             data:{
//                 user_id:req.session.user_id,
//                 nick_name:req.session.nickname,
//                 avatar_src:req.session.avatar_src
//             },
//         })
//     }
//     return res.json({
//         code:1,
//         message:'非法'
//     })
// })
//关于session的坑：前提（每个用户，无论是否注册过，都会为其生成一个session元组存储在
//session表中）
//req.session指携带cookie的用户对应的一个session元组
//req.session.id表示session元组中的session_id项
//req.session.XXXXX表示session元组中data项中cookie内的自定义值
//如在用户登录成功时设置：req.session.user_id='randy'
//则在后续做用户权限验证时可以使用if(req.session.user_id)来判断
//该用户是否为注册过的用户。
//注意不要用(req.session.id)来判断用户是否注册过，因为每个进入过
//站点的用户都可以访问到其req.session.id。


//首页==================================================================
//获取首页轮播图
router.get('/api/carousel',(req,res,next)=>{
    connection.query('select * from carousel',(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})
//获取文章总数做分页加载
router.get('/api/article_count',(req,res,next)=>{
    connection.query('select count(*) as count from article',(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,   
            message:'OK'
        })
    })
})

//按照分页获取最新文章（预览内容）
router.get('/api/new_articles',(req,res,next)=>{
    connection.query('select title,left(content,5) as pre_content from article limit 8',(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//按照分页获取热门文章（预览内容）
router.get('/api/hot_articles',(req,res,next)=>{
    connection.query('select title,left(content,5) as pre_content from article order by read_count desc limit 8',(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//分类页==================================================================
//根据分类获取文章总数做分页
router.get('/api/category_articles_count',(req,res,next)=>{
    connection.query('select count(*) as count from article where tag=?',[req.query.tag],(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//根据分类获取文章（预览内容）
router.get('/api/category_articles',(req,res,next)=>{
    if(req.query.tag==='all'){
        connection.query('select title,left(content,5) as pre_content,tag from article limit ?,8',[(req.query.page-1)*8],(err,results,fields)=>{
            if(err) return next(err)
            res.json({
                code:0,
                data:results,
                message:'OK'
            })
        })
    }
    else{
        connection.query('select title,left(content,5) as pre_content,tag from article where tag=? limit ?,8',[req.query.tag,(req.query.page-1)*8],(err,results,fields)=>{
            if(err) return next(err)
            res.json({
                code:0,
                data:results,
                message:'OK'
            })
        })
    }
})

//留言页==================================================================
//获取留言总数做分页加载
router.get('/api/message_count',(req,res,next)=>{
    connection.query('select count(*) as message_count from message limit 8',(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//按照分页获取最新留言
router.get('/api/new_messages',(req,res,next)=>{
    connection.query('select content from message order by id limit ?,1',[(req.query.page-1)*8,req.query.count],(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//按照分页获取热门留言
router.get('/api/hot_message',(req,res,next)=>{
    connection.query('select content from message order by id limit 8',(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//回复某个留言
router.post('/api/request_message',(req,res,next)=>{
    connection.query('insert into message_comment(user_id,content) values(?,?)',[my_id,my_value],(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            message:'OK'
        })
    })
})


//获取子留言
// var message_id_arr=[1,2,3]
// function get_message_comment(){
//     return new Promise((resolve,reject)=>{
//         var res_arr=[]
//     for(var i=1;i<=message_id_arr.length;i++){
//         connection.query('select *  from message_comment where message_id=?',[i],(err,results,fields)=>{
//             if(err) return next(err)
//             res_arr.push(results)
//             console.log(i);
//             if(res_arr.length===message_id_arr.length){
//                 resolve(res_arr)
//             }
//         })
//     }
//     })
// }
// router.get('/api/message_comment',(req,res,next)=>{
//     get_message_comment().then((contents)=>{
//         res.json({
//             code:0,
//             data:contents,
//             message:'OK'
//         })
//     })  
// })
router.get('/api/message_comment',(req,res,next)=>{
    var message_id_arr=[1,2,3]
    var res_arr=[]
    for(var i=1;i<=message_id_arr.length;i++){
        connection.query('select * from message_comment where message_id=?',[i],(err,results,fields)=>{
            if(err) return next(err)
            res_arr.push(results)
            if(res_arr.length===message_id_arr.length){
                res.json({
                        code:0,
                        data:res_arr,
                        message:'OK'
                })
            }
        })
    }
})

//写留言
router.post('/api/leave_message',(req,res,next)=>{
    connection.query('insert into message(user_id,content) value(?,?)',[req.body.user_id,req.body.content],(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            message:'添加留言成功'
        })
    })
})

//写留言评论
router.post('/api/leave_message_comment',(req,res,next)=>{
    connection.query('insert into message_comment(message_id,content) value(?,?)',[req.body.message_id,req.body.content],(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'OK'
        })
    })
})

//资源页==================================================================
//获取所有分类的资源
router.get('/api/source',(req,res,next)=>{
    let source_arr=[]
    for(var i=1;i<=2;i++){
        connection.query('select * from source'+i,(err,results,fields)=>{
            if(err) return next(err)
            source_arr.push(results)
            if(source_arr.length===2){
                res.json({
                    code:0,
                    data:source_arr,
                    message:'OK'
                })
            }
        })
    }
})

//注册登录页==============================================================
//注册
router.post('/api/regist',(req,res,next)=>{
    connection.query('select * from user where user.nickname=?',[req.body.nickname],(err,results,fields)=>{
        if(err) return next(err)
        if(results.length===0){
            connection.query('insert into user(nickname,password) value(?,?)',[req.body.nickname,md5(req.body.password+S_KEY)],(err,results,fields)=>{
                if(err) return next(err)
                res.json({
                    code:0,
                    message:'注册成功'
                })
            })
        }
        else{
            return res.json({
                code:1,
                message:'该昵称已注册'
            })
        }
    })
})

//登录
router.post('/api/login',(req,res,next)=>{
    connection.query('select * from user where user.nickname=?',[req.body.nickname],(err,results,fields)=>{
        if(err) return next(err)
        if(results.length===0){
            res.json({
                code:1,
                message:'该昵称未注册'
            })
        } 
        else{
            connection.query('select * from user where user.nickname=? and user.password=?',[req.body.nickname,md5(req.body.password+S_KEY)],(err,results,fields)=>{
                if(err) return next(err)
                if(results.length===0){
                    res.json({
                        code:2,
                        message:'密码错误'
                    })
                }
                else{
                    connection.query('select * from user where user.nickname=?',[req.body.nickname],(err,results,fields)=>{
                        if(err) return next(err)
                        console.log(results);
                        req.session.user_id=results[0].id
                        req.session.nickname=results[0].nickname
                        req.session.avatar_src='默认路径'
                        req.session.profile='这个人太懒了，啥都不想写'
                        res.json({
                            code:0,
                            data:results[0],
                            message:'登陆成功'
                        })
                    })
                }
            })
        }
    })
})

//验证码（防机器频繁注册）

//用户个人中心页===========================================================
//登陆成功时请求此接口获取个人信息(前端请求此接口)   或者   在cookie有效期类进入站点时获取个人信息（前端请求此接口）
router.get('/api/get_user_acount',(req,res,next)=>{
    if(req.session.user_id){
        res.json({
            code:0,
            data:{
                user_id:req.session.user_id,
                user_info:{
                    nickname:req.session.nickname,
                    avatar_src:req.session.avatar_src,
                    profile:req.session.profile
                }
            },
            message:'获取个人信息成功'
        })
    }
    else{
        res.json({
            code:1,
            message:'未登录状态'
        })
    }
})

//上传/修改头像

//修改个人简介
2
//文章详情页===============================================================
router.get('/api/article_detail',(req,res,next)=>{
    connection.query('select * from article where id=?',[req.query.id],(err,results,fields)=>{
        if(err) return next(err)
        res.json({
            code:0,
            data:results,
            message:'获取文章成功'
        })
    })
})

//用户查看文章次数+1

//用户点赞

//用户收藏

//获取文章查看次数总数

//获取点赞数

//获取收藏数

//搜索结果页===============================================================
//根据关键词请求文章（预览内容）
router.post('/api/search_article',(req,res,next)=>{
    connection.query('select * from article where article.content like "%"'+'?'+'"%"',[req.body.keywords],(err,results,fields)=>{
        if(err) return next(err)
        console.log(req.body.keywords);
        console.log(results);
        res.json({
            code:0,
            data:results,
            message:'搜索成功'
        })
    })
})




module.exports=router