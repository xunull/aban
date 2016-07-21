var exec= require('child_process').exec;
var file_analysis=require('./file_analysis');

exec('echo $my_github_workspaces',function(err,stdout,stderr){
  if(err) {
    console.log('获取github工作路径出错');
  } else {
    file_analysis.analysisSync(stdout.replace('\n',''));
  }

});
