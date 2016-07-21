import os
import yaml

class FileAnalysis:
    '''
    cofig 是dict,是config.yaml 中的信息
    '''
    def __init__(self, path,config):
      self.basePath = path
      self.config = config
      self.tree={}
      self.extensionCnt={}
      self.extensionLineCnt={}
      self.__initConfig()

    def __initConfig(self):
        for index in range(len(self.config['extensions'])):
            self.extensionCnt[self.config['extensions'][index]]=0
            self.extensionLineCnt[self.config['extensions'][index]]=0



    # 参数的默认值不能使用 self ,应该就是不能使用变量, js的函数默认值是可以使用在前面的参数的
    def analysis(self,path,baseTree=None):
        if baseTree == None:
            baseTree = self.tree
        files=[]
        dirs=[]
        # print('开始分析')
        results = os.listdir(path)
        tempTree={};
        for index in range(len(results)):
            testPath=os.path.join(path,results[index])
            if os.path.isfile(testPath):
                files.append(results[index])
                baseTree[results[index]]=None
                self.__analysis_extension(testPath)
            elif os.path.isdir(testPath):
                if results[index][0]=='.':
                    # 以 . 开头的 暂时认为是排除的文件夹
                    pass
                elif results[index] in self.config['excludeDirs']:
                    # 在排除的目录中
                    pass
                else:
                    dirs.append(results[index])
                    baseTree[results[index]]={}
                    self.analysis(testPath,baseTree[results[index]])

        if baseTree is self.tree:
            result_file=open('result.yaml','w+')
            config = yaml.load(result_file)
            yaml.dump(self.tree,result_file)

    def __analysis_line(self,filename,extension):
        try:
            file = open(filename)
            count = len(file.readlines())
            self.extensionLineCnt[extension]+=count
        except UnicodeDecodeError:
            print('打开 ',filename,' 解码时发生UnicodeDecodeError 异常')
        else:
            file.close()
        # with open(filename) as file:
        #     print(filename)
        #     count = len(file.readlines())
        #     self.extensionLineCnt[extension]+=count

    def __analysis_extension(self,filename):
        result = os.path.splitext(filename)
        # 等于二的才是真正有扩展名的
        if  result[1] != '' and result[1] in self.config['extensions']:
            self.extensionCnt[result[1]]+=1
            self.__analysis_line(filename,result[1])
