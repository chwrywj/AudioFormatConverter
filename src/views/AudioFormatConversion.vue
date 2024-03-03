<template>
    <div class="my-container">
        <div class="left">
            <template v-if="(fileData==null || fileData.length==0) && !tableLoading">
                <div class="add-file-cover">
                    <i class="my-icon my-icon-add-audio" @click="dialogOpenFile"></i>
                    <div class="tip">{{$t('audioFormatConvert.tip')}}<br/>{{$t('common.addFileTip')}}{{audioExtArr.join(', ')}}<br>{{$t('audioFormatConvert.addFileTip')}}{{videoExtArr.join(', ')}}</div>
                    <div class="add-filt-btn-box">
                        <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenFile">
                            <i class="my-icon my-icon-file"></i>
                            <span>{{$t('common.addAudioBtn')}}</span>
                        </el-button>
                        <el-tooltip :content="$t('common.addDirTip')" placement="top">
                            <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenDirectory('input')">
                                <i class="my-icon my-icon-folder"></i>
                                <span>{{$t('common.addDirBtn')}}</span>
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="table-top">
                    <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="processIng">
                        <i class="my-icon my-icon-file"></i>
                        <span>{{$t('common.addAudioBtn')}}</span>
                    </el-button>
                    <el-tooltip :content="$t('common.addDirTip')" placement="top">
                        <el-button type="primary" size="small" @click="dialogOpenDirectory('input')" :disabled="processIng">
                            <i class="my-icon my-icon-folder"></i>
                            <span>{{$t('common.addDirBtn')}}</span>
                        </el-button>
                    </el-tooltip>
                    <el-button type="danger" size="small" @click="fileData=[]" :disabled="processIng">
                        <i class="my-icon my-icon-delete"></i>
                        <span>{{$t('common.clearFile')}}</span>
                    </el-button>
                </div>
                <el-table
                    v-loading="tableLoading"
                    :data="filePageData"
                    size="small"
                    border
                    style="width: 100%;"
                    :header-cell-style="{backgroundColor:'#f5f7fa',color:'#606266'}">
                    <el-table-column prop="sourcePath" :label="$t('common.sourcePath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.sourcePath)" style="cursor: pointer;">{{scope.row.sourcePath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceSize" :label="$t('common.sourceSize')" min-width="80px" align="right">
                        <template #default="scope">
                            {{scope.row.sourceSize!=null?(scope.row.sourceSize/1024/1024).toFixed(2)+"MB":""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceFormat" :label="$t('audioFormatConvert.sourceFormat')" min-width="80px"></el-table-column>
                    <el-table-column prop="newPath" :label="$t('common.newPath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.newPath)" style="cursor: pointer;">{{scope.row.newPath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="newSize" :label="$t('common.newSize')" min-width="80px" align="right">
                        <template #default="scope">
                            {{scope.row.newSize!=null?(scope.row.newSize/1024/1024).toFixed(2)+"MB":""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="newFormat" :label="$t('audioFormatConvert.newFormat')" min-width="100px" fixed="right">
                        <template #default="scope">
                            <el-select class="content" v-model="scope.row.newFormat" :disabled="processIng" :placeholder="$t('common.selectTip')" size="small">
                                <el-option v-for="item in audioExtArr" :key="item" :label="item" :value="item"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" :label="$t('common.status')" width="100px" fixed="right">
                        <template #default="scope">
                            <el-progress v-if="scope.row.status==1" class="progress" :text-inside="true" :stroke-width="20" :percentage="scope.row.convertPercent" text-color="#fff"></el-progress>
                            <span v-else v-html="showConvertStatus(scope.row.status)"></span>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" fixed="right">
                        <template #default="scope">
                            <div class="operate">
                                <i class="my-icon my-icon-cuo" :class="{'disabled': processIng}" @click="delFileData(scope)"></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="table-data-page">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :pager-count="5"
                        small
                        :total="fileData.length"
                        :page-size="pageSize"
                        :current-page="pageIndex"
                        @current-change="pageIndexChange">
                    </el-pagination>
                </div>
            </template>
        </div>
        <div class="setting">
            <div class="title">{{$t('audioFormatConvert.convertSetting')}}</div>
            <el-form :model="processOptions" ref="processOptionsForm" label-position="top" size="small">
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('common.taskThreadsNumberTip')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.taskThreadsNumber')}}
                    </template>
                    <el-slider class="content slider" v-model="processOptions.taskThreadsNumber" :disabled="processIng" :min="1" :max="5"></el-slider>
                </el-form-item>
                <el-form-item :label="$t('audioFormatConvert.batchSetNewFormat')">
                    <el-select class="content" v-model="processOptions.newFormat" :disabled="processIng" @change="newFormatChange" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in audioExtArr" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('common.audioTip1')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.audioBitrate')}}
                    </template>
                    <el-select class="content" v-model="processOptions.audioBitrate" :disabled="processIng" :placeholder="$t('common.selectTip')">
                        <el-option :label="$t('common.useSourceBitrate')" value="source"></el-option>
                        <el-option :label="$t('common.customBitrate')" value="custom"></el-option>
                        <el-option :label="$t('common.customMaxBitrate')" value="customMax"></el-option>
                        <el-option v-for="item in audioBitrateArr" :label="item+' kbps'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="processOptions.audioBitrate=='custom' || processOptions.audioBitrate=='customMax'" prop="customBitrate" :rules="{ pattern: /^[0-9]+$/, message: $t('common.mustBeInt'), trigger: 'blur' }">
                    <template #label>
                        <el-tooltip placement="top">
                            <template #content>
                                <div v-if="processOptions.audioBitrate=='custom'" style="line-height: 24px;">{{$t('common.customBitrateTip1')}}</div>
                                <div v-if="processOptions.audioBitrate=='customMax'" style="line-height: 24px;">{{$t('common.customBitrateTip1')}}<br/>{{$t('common.customBitrateTip2')}}</div>
                            </template>
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{processOptions.audioBitrate=='custom' ? $t('common.customBitrate') : $t('common.customMaxBitrate')}}
                    </template>
                    <el-input class="content" v-model="processOptions.customBitrate" :disabled="processIng" :placeholder="$t('common.useSourceBitrate')" clearable>
                        <template #append>
                            kbps
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('common.audioTip1')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.audioSampleRate')}}
                    </template>
                    <el-select class="content" v-model="processOptions.audioSampleRate" :disabled="processIng" :placeholder="$t('common.selectTip')">
                        <el-option :label="$t('common.useSourceSampleRate')" value="source"></el-option>
                        <el-option v-for="item in audioSampleRateArr" :label="item+' Hz'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('common.audioChannel')">
                    <el-select class="content" v-model="processOptions.audioChannel" :disabled="processIng" :placeholder="$t('common.selectTip')">
                        <el-option :label="$t('common.useSourceChannel')" value="source"></el-option>
                        <el-option :label="$t('common.mono')" value="1"></el-option>
                        <el-option :label="$t('common.stereo')" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('common.outDir')" prop="outputPath" :rules="{required: true, message: $t('common.selectOutputDirTip'), trigger: 'change'}">
                    <el-input class="content" v-model="processOptions.outputPath" :disabled="processIng" clearable>
                        <template #append>
                            <i class="open-folder my-icon my-icon-folder" @click="dialogOpenDirectory('output')"></i>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="bottom">
                <el-button type="primary" size="large" class="btn-process" @click="goConvert" 
                    :disabled="fileData==null || fileData.length==0 || fileConvertPercent==100">
                    {{processIng?$t('audioFormatConvert.convertStop'):$t('audioFormatConvert.convertStart')}}
                </el-button>
            </div>
        </div>
    </div>
</template>
  
<script>
    import common from '../utils/common';
    import { toRaw } from '@vue/reactivity'
    export default {
        name: 'AudioFormatConversion',
        data() {
            return {
                videoExtArr:['mp4','mov','avi','mkv','ts','flv','swf','mpeg','mpg','m4v','vob','wmv'],
                audioExtArr:['mp3','wma','ogg','aac','aiff','au','flac','mp2','m4a','m4r','ac3','amr','ra','rm','wav'],
                audioBitrateArr:[64,96,128,160,192,256,320],
                audioSampleRateArr:[8000,11025,12000,16000,22050,24000,32000,44100,48000,96000],

                fileData:[],
                tableLoading:false,
                pageIndex: 1,
                pageSize: 50,

                processIng:false,

                processOptions:{
                    taskThreadsNumber:2,
                    newFormat:null,
                    audioBitrate:'source',
                    customBitrate:null,
                    audioSampleRate:'source',
                    audioChannel:'source',
                    outputPath:''
                }
            }
        },
        computed:{
            filePageData(){
                return this.fileData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
            },

            fileConvertPercent(){
                if(this.fileData.length==0)
                    return 0;
                var filterData = this.fileData.filter(item => {
                    return item.status == 2 || item.status == 3
                });
                
                return parseInt((filterData.length/this.fileData.length)*100,10);
            }
        },
        methods: {
            dialogOpenFile(){
                common.dialogOpenFile(toRaw(this.audioExtArr).concat(toRaw(this.videoExtArr)))
                .then(filePaths=>{
                    if(filePaths!=null && filePaths.length>0){
                        this.tableLoading=true;
                        setTimeout(()=>{
                            for(var i=0;i<filePaths.length;i++){
                                var filterData = this.fileData.filter(item => {
                                    return item.sourcePath == filePaths[i]
                                });
                                if(filterData.length>0){
                                    continue;
                                }
                                this.fileData.push({
                                    sourcePath:filePaths[i],
                                    sourceSize:null,
                                    sourceFormat:filePaths[i].substr(filePaths[i].lastIndexOf('.')+1),
                                    newPath:null,
                                    newSize:null,
                                    newFormat:this.processOptions.newFormat,
                                    status:0,
                                    convertPercent:0
                                });
                            }
                            this.tableLoading=false;
                            this.setAudioOrAudioMetaData();
                        },100);
                    }
                });
            },

            dialogOpenDirectory(dirType){
                common.dialogOpenDirectory()
                .then(dirPaths=>{
                    if(dirPaths==null || dirPaths=='')
                        return;
                    if(dirType=="output"){
                        this.processOptions.outputPath = dirPaths
                    }else if(dirType=="input"){
                        var fileData = common.getFilesFromDir(dirPaths,toRaw(this.audioExtArr).concat(toRaw(this.videoExtArr)));
                        if(fileData!=null && fileData.length>0){
                            this.tableLoading=true;
                            setTimeout(()=>{
                                for(var i=0;i<fileData.length;i++){
                                    var filterData = this.fileData.filter(item => {
                                        return item.sourcePath == fileData[i].filePath
                                    });
                                    if(filterData.length>0){
                                        continue;
                                    }
            
                                    this.fileData.push({
                                        sourcePath:fileData[i].filePath,
                                        sourceSize:fileData[i].fileSize,
                                        sourceFormat:fileData[i].filePath.substr(fileData[i].filePath.lastIndexOf('.')+1),
                                        newPath:null,
                                        newSize:null,
                                        newFormat:this.processOptions.newFormat,
                                        status:0,
                                        convertPercent:0
                                    });
                                }
                                this.tableLoading=false;
                                //this.setAudioOrAudioMetaData();
                            },100);
                        }
                    }
                });
            },

            //异步获取媒体参数，防止页面卡顿
            setAudioOrAudioMetaData(){
                var filterData = this.fileData.filter(item => {
                    return item.sourceSize == null
                });
                function* gengeratorFun() {
                    for (var i=0;i<filterData.length;i++) {
                        yield getMediaMetaData(filterData[i].sourcePath);
                    }
                }
                
                var getMediaMetaData = (filePath)=>{
                    var curData = this.fileData.filter(item => {
                        return item.sourcePath == filePath
                    });
                    if(curData.length==0){
                        console.log('empty');
                        var emptyData = this.fileData.filter(item => {
                            return item.sourceSize == null
                        });
                        if(emptyData.length>0){
                            setTimeout(() => {
                                gf.next();
                            }, 30);
                        }
                    }else{
                        common.getMediaMetaData(filePath,(metaData)=>{
                            try{
                                curData[0].sourceSize=metaData.format.size;
                            }catch(e){
                                console.log(e);
                            }
                            gf.next();
                        });
                    }
                }

                var gf = gengeratorFun();
                gf.next();
            },

            showConvertStatus(status){
                if(status==0){
                    return this.$t('audioFormatConvert.unConvert');
                }else if(status==1){
                    return "<span style='color:var(--el-color-primary-dark-2)'>"+this.$t('audioFormatConvert.processIng')+"</span>";
                }else if(status==2){
                    return "<span style='color:var(--el-color-primary)'>"+this.$t('audioFormatConvert.convertSuccess')+"</span>";
                }else if(status==3){
                    return "<span style='color:var(--el-color-danger)'>"+this.$t('audioFormatConvert.convertFail')+"</span>";
                }
            },

            pageIndexChange(e) {
                this.pageIndex = e;
            },

            delFileData(scope){
                if(this.processIng){
                    return;
                }
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                this.fileData.splice(rowIndex,1);
            },

            renameForNewFile(filePath){
                if(common.fileExists(filePath)){
                    return this.renameForNewFile(filePath.replace(".","(1)."));
                }
                return filePath;
            },

            newFormatChange(e){
                this.processOptions.newFormat=e;
                for(var i=0;i<this.fileData.length;i++){
                    this.fileData[i].newFormat=e;
                }
            },

            killAudioFormatConvertCommand(){
                common.killAudioFormatConvertCommand();
                this.processIng=false;
                var filterData = this.fileData.filter(item => {
                    return item.status == 1
                });
                for(var i=0;i<filterData.length;i++){
                    filterData[i].status=0;
                    filterData[i].convertPercent=0;
                }

                setTimeout(() => {
                    for(var i=0;i<filterData.length;i++){
                        if(!this.isNullOrEmpty(filterData[i].newTmpPath)){
                            common.deleteFile(filterData[i].newTmpPath);
                            filterData[i].newTmpPath=null;
                        }
                    }
                }, 1000);
            },

            goConvert(){
                if(this.fileConvertPercent==100)
                    return;
                if(this.processIng){
                    this.killAudioFormatConvertCommand();
                    return;
                }

                var newFormatNoSettingData = this.fileData.filter(item => {
                    return item.newFormat == null
                });
                if(newFormatNoSettingData.length>0){
                    this.$message.error(this.$t('audioFormatConvert.newFormatNoSettingTip'));
                    return;
                }
                
                this.$refs['processOptionsForm'].validate((valid) => {
                    if (valid) {
                        this.processIng=true;
                        this.convertStart();
                    }
                });
            },

            convertStart(){
                for(var i=0;i<this.fileData.length;i++){
                    if(!this.processIng)
                        return;
                    
                    var filterData = this.fileData.filter(item => {
                        return item.status == 1
                    });
                    if(filterData.length==this.processOptions.taskThreadsNumber){
                        return;
                    }

                    if(this.fileData[i].status!=0){
                        continue;
                    }

                    ((j)=>{
                        var outputPath=this.processOptions.outputPath.replace(/\\/g,"/");
                        if(outputPath.length==outputPath.lastIndexOf("/")+1){
                            outputPath=outputPath.substr(0,outputPath.length-1);
                        }
                        var sourcePath = this.fileData[j].sourcePath.replace(/\\/g,"/");
                        outputPath=outputPath+sourcePath.substr(sourcePath.lastIndexOf('/'));
                        outputPath=outputPath.substr(0,outputPath.lastIndexOf('.')+1)+this.fileData[j].newFormat;
                        outputPath=this.renameForNewFile(outputPath);
        
                        var sourceFormat=this.fileData[j].sourcePath.substr(this.fileData[j].sourcePath.lastIndexOf('.')+1).toLocaleLowerCase();
                        
                        this.fileData[j].status=1;
                        this.fileData[j].newTmpPath=outputPath;

                        common.audioFormatConvert(this.fileData[j].sourcePath, outputPath, {
                            vn:this.videoExtArr.includes(sourceFormat),
                            audioBitrate:this.processOptions.audioBitrate=='custom'?this.toNum(this.processOptions.customBitrate):this.toNum(this.processOptions.audioBitrate),
                            audioSampleRate:this.processOptions.audioSampleRate=='source'?null:this.processOptions.audioSampleRate,
                            audioChannel:this.processOptions.audioChannel=='source'?null:this.processOptions.audioChannel,
                        },(progress)=>{
                            if(!this.isNullOrEmpty(progress.percent) && !isNaN(progress.percent))
                                this.fileData[j].convertPercent=Number(progress.percent.toFixed(1));
                        },()=>{
                            this.fileData[j].status=2;
                            this.fileData[j].newPath=outputPath;
                            this.fileData[j].newTmpPath=null;
                            this.convertStart();
                            this.convertOver();
                            common.getMediaMetaData(outputPath,(metaData)=>{
                                this.fileData[j].newSize=metaData.format.size;
                                this.fileData[j].newBitRate=metaData.format.bit_rate;
                                for(var k=0;k<metaData.streams.length;k++){
                                    if(metaData.streams[k].codec_type=='audio'){
                                        this.fileData[j].newFrameRate=Number(eval(metaData.streams[k].r_frame_rate).toFixed(0));
                                        this.fileData[j].newWidth=metaData.streams[k].width;
                                        this.fileData[j].newHeight=metaData.streams[k].height;
                                        break;
                                    }
                                }
                                console.log(metaData)
                            });
                        },()=>{
                            if(!this.processIng)
                                return;
                            common.deleteFile(this.fileData[j].newTmpPath);
                            this.fileData[j].newTmpPath=null;
                            this.fileData[j].status=3;
                            this.convertStart();
                            this.convertOver();
                        });
                    })(i);
                }
            },

            convertOver(){
                if(this.fileConvertPercent==100){
                    setTimeout(() => {
                        this.$alert(this.$t('audioFormatConvert.convertOver'), this.$t('common.tip'), {
                            confirmButtonText: this.$t('common.ok'),
                            callback: action => {
                                this.processIng=false;
                            }
                        });
                    }, 800);
                }
            },

            openPath(url){
                common.openPath(url);
            }
        }
    }
</script>