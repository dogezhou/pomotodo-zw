// 函数：删除任务
delete_task = function() {

    var task_id = $(this).next().attr('id').substring(5); // 点击的任务这一列的内容
    var task_li = $(this).parent()  // 任务这一列内容
    $.ajax({
      type:'GET',
      url: '/delete' + '/' + task_id,
      context: task_li,
      success:function(result) {
        if(result.status === 1) {
          $(this).slideUp(300, function() { $(this).remove(); }); //
          console.log(result);
        }
      }
    });
  }

// 函数：创建长任务，用在右边的输入框中
create_long_task = function() {
    var task_name = $('#task-name').val() // 代表表单中输入的值
    console.log(task_name)
    var tasks = $('.tasks')
    $.ajax({
      type:'GET',
      url: '/add' + '/' + task_name,
      context: tasks,
      success: function(result) {
        if(result.status === 1) {
          $(this).append(`<li class="task">
                            <button type="button" class="checked btn btn-default btn-xs" title="标记已完成">
                              <span class="glyphicon glyphicon-ok-circle" aria-hidden="true"></span>
                            </button>
                          <h4 id="task-${result.task_id}" style="display:inline-block; width:80%;">${result.task_name}</h4>
                          <span class="pin-btn pin-false" style="display:inline-block;">
                            <button type="button" class="btn btn-default btn-xs" title="置顶任务">
                                <span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span>
                            </button>
                          </span>`
                           );
          $('.checked').on('click', delete_task); // 在新建的li上重新绑定事件
          $('.pin-false').on('click', pin_task); //
          console.log(result);
          $('#task-name').val('')   // 清空表单中的内容
        }
      }
    });
  }

// 函数: pin_task 和 unpin_task 都需要更新pin_box
update_pin_box = function() {
    //todo:
}
// 函数：pin置顶任务
pin_task = function() {
    // 获取task_id
    var task_id = $(this).prev().attr('id').substring(5);
    // 请求设置task的 pinned 属性为True,
    var task_li = $(this).parent()  // 任务这一列内容

    $.ajax({
      type:'GET',
      url: '/pin' + '/' + task_id,
      context: task_li,
      success:function(result) {
        if(result.status === 1) {
            // 如果成功 任务置顶，并且改变 pin-box 中内容
            var tasks = $('.tasks')
            tasks.prepend(this)
            // 置顶之后改变按钮值
            $(this).find(".pin-false").remove();
            console.log("创建一个danger button")
            $(this).append(`<span class="pin-btn pin-true" style="display:inline-block;">
                                <button type="button" class="pin-btn btn btn-danger btn-xs" title="置顶任务">
                                    <span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span>
                                </button>
                            </span>`);
            // 重新绑定事件
            $(this).find(".pin-true").on('click', unpin_task);

            // 改变pin-box 中的内容
            $('#pin-description').text(result.task_name);
            $('.glyphicon-ok').attr({'id': "pin-task-" + result.task_id});
        }
      }
    });
}

// 函数：unpin任务
unpin_task = function() {
    // 获取task_id
    var task_id = $(this).prev().attr('id').substring(5);
    var task_li = $(this).parent()  // 任务这一列内容

    $.ajax({
      type:'GET',
      url: '/unpin' + '/' + task_id,
      context: task_li,
      success:function(result) {
        if(result.status === 1) {
            // 把该任务放到最后
            var tasks = $('.tasks')
            tasks.append(this)
            // 改变按钮值
            $(this).find(".pin-true").remove();
            $(this).append(`<span class="pin-btn pin-false" style="display:inline-block;">
                                <button type="button" class="pin-btn btn btn-default btn-xs" title="置顶任务">
                                    <span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span>
                                </button>
                            </span>`);
            // 绑定事件
            $(this).find(".pin-false").on('click', pin_task);
            // 改变pin-box 中的内容
        }
      }
    });
}


// 点击添加按钮输入任务
$(function() {

  console.log( "ready!" ); // sanity check

  $('#add-task').on('click', create_long_task);
});


// 点击已完成按钮删除任务
$(function() {

  console.log( "ready!" ); // sanity check

  $('.checked').on('click', delete_task);
});

// 回车键添加长任务
// html 中 onkeypress

// 点击置顶按钮 pin到最最顶层
$(function()  {
    console.log( "ready!" ); // sanity check

    $('.pin-false').on('click', pin_task);
  }
)

// 点击已经pin的按钮unpin
$(function()  {
    console.log( "ready!" ); // sanity check

    $('.pin-true').on('click', unpin_task);
  }
)


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++ 按钮计时处理 ++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 一个任务的时间 5秒 (毫秒为单位)
time_per_task = 1000*5

// 函数：startTime
start_counter = function() {
    // 开始时间:
    var start_time = new Date()

    // 结束时间:
    var end_time = new Date(start_time.getTime() + time_per_task)

    // 循环执行
    setTimeout(function() {start_counter_loop(start_time, end_time)},500)
}
start_counter_loop = function(start_time, end_time) {
    // 当前时间：
    var current_time = new Date()

    // 倒计时时间 (结束时间减当前时间)
    var rest_time = new Date(end_time.getTime() - current_time.getTime())
    var m = rest_time.getMinutes()
    var s = rest_time.getSeconds()
    // 当数字小于10时在数字添加一个0
    m=check_time(m)
    s=check_time(s)
    // 显示倒计时时间（分秒）
    $('#start-task').text(m+":"+s)

    // 分和秒不同时为零，继续倒计时，否则显示一个输入short_task输入框
    if (!(rest_time.getMinutes() === 0 && rest_time.getSeconds() === 0)){
        setTimeout(function() {start_counter_loop(start_time, end_time)},500)
    }else{
        task_log_form(start_time, end_time)
    }
}
check_time = function (i) {
    if (i<10){
      i="0" + i
    }
    return i
    }
// 创建短任务表单
task_log_form = function(start_time, end_time) {
    $('#start-task').remove()
    $('.pomo').prepend(`<!-- 添加任务的表单 -->
                        <div class="box-header">
                            <input class="form-control" id="task-log-name" type="text" name="taskinput" placeholder="完成了什么任务？"
                                   style="display:inline-block; width:86%"/>
                            <input class="btn btn-default" id="add-task-log" type="submit" value="添加" style="display:inline-block;" />
                        </div>`)
    // 绑定回车键事件
    $('#task-log-name').keydown(function(event) {
        if (event.which === 13){
            create_task_log(start_time, end_time)
        }
    })
    // 绑定按钮点击事件
    $('#add-task-log').on('click', function(){
        create_task_log(start_time, end_time)})

    // todo: 默认表单中的值为 pin-box 中的

create_task_log = function(start_time, end_time) {

    var task_name = $('#task-log-name').val() // 表单中输入的值是log的任务名

    // 记录时间
    start_time = start_time.getTime()

    log_li = $('.logs')
    data = {
        'start_time': start_time}

    $.ajax({
      type:'GET',
      url: '/log' + '/' + task_name,
      data: data,
      context: log_li,
      success:function(result) {
        if(result.status === 1) {
            $(this).append(`<li class="log">
                                <h4 id="log-${ result.log_id }">
                                    ${ result.start_time } - ${ result.end_time }：
                                    ${ result.task_name }
                                </h4>
                             </li>`)
            console.log(result);
            // 成功记录任务后重新创建按钮
            $('.pomo .box-header').remove()
            $('.pomo').prepend(`<button id="start-task" type="button"
                                class="btn btn-default" style="width:100%">开始番茄</button>
                                                                    `)}
            // 绑定事件
            $('#start-task').on('click', counter)
      }
    });
}
}
// 函数：counter
counter = function() {
    // 更新按钮
    $('#start-task').attr("class", "btn btn-danger")
    // 取消 click 事件绑定
    $('#start-task').unbind('click')

    start_counter()
}


// 点击开始番茄，开始
$(function() {
    console.log("#start-task ready!");

    $('#start-task').on('click', counter)
})
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++