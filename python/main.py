import os
import yaml
from file_analysis import FileAnalysis

config_file=open('config.yaml')
config = yaml.load(config_file)

mgw = os.environ['my_github_workspaces']


analysis = FileAnalysis(mgw,config)

print(analysis.basePath)
analysis.analysis(mgw)

print(analysis.extensionCnt)
print(analysis.extensionLineCnt)
