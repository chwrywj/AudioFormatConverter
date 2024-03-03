const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = class FfmpegClass {
    constructor() {
        this._ffmpegBinPath;
        this._cutAudioCommand;
        this._mergeAudioCommand;
        this._compressAudioCommandArr;
        this._audioFormatConvertCommandArr;

        this.setFfmpegPath();
    }

    setFfmpegPath() {
        const platform = os.platform()
        const arch = os.arch()
        const basePath = path.resolve(
            process.env.NODE_ENV !== 'production'?'./resources/bin':process.resourcesPath + '/bin',
            platform,
            // arm64 is limit supported only for macOS
            platform === 'darwin' && arch === 'arm64'
            ? 'arm64'
            : 'x64',
        )
        var name='ffmpeg';
        this._ffmpegBinPath = path.resolve(
            basePath,
            platform === 'win32' ? `${name}.exe` : name,
        )
        .replace(/\\/g,"/")
        .replace('/src/js/bin/','/bin/');
        ffmpeg.setFfmpegPath(this._ffmpegBinPath);
    }

    getMediaMetaData(audioPath,callback){
        ffmpeg(audioPath).ffprobe((err, data) => {
            //console.log(err)
            if(err==null && callback!=null){
                callback(data);
            }
        });
    }

    cutAudio(input, output, opts, progressCallback,endCallback,errorCallback) {
        try{
            this._cutAudioCommand = ffmpeg(input)
                .seekInput(opts.seekInput)
                .duration(Number((opts.duration/opts.speed).toFixed(3)))
            if(opts.speed!=1){
                if(opts.speed==0.25)
                    this._cutAudioCommand = this._cutAudioCommand.audioFilters('atempo=0.5,atempo=0.5');
                else if(opts.speed==4)
                    this._cutAudioCommand = this._cutAudioCommand.audioFilters('atempo=2,atempo=2');
                else
                    this._cutAudioCommand = this._cutAudioCommand.audioFilters('atempo='+opts.speed);
            }
            if(opts.volume!=1){
                this._cutAudioCommand = this._cutAudioCommand.audioFilters('volume='+Number(opts.volume.toFixed(2)));
            }
            if(opts.audioBitrate!=null){
                ffmpegCommand=ffmpegCommand.outputOptions(['-b:a',opts.audioBitrate+'k']);
            }
            if(opts.audioSampleRate!=null){
                ffmpegCommand=ffmpegCommand.audioFrequency(opts.audioSampleRate);
            }
            if(opts.audioChannel!=null){
                ffmpegCommand=ffmpegCommand.audioChannels(opts.audioChannel);
            }
            this._cutAudioCommand = this._cutAudioCommand
                .on('start', function (commandLine) {
                    console.log('Cut start: ' + commandLine);
                })
                .on('progress', function (progress) {
                    console.log('Processing: ' + progress.percent + '% done');
                    if(progressCallback!=null){
                        progressCallback(progress);
                    }
                })
                .on('end', function (stdout, stderr) {
                    console.log('Cut succeeded!');
                    if(endCallback!=null){
                        endCallback();
                    }
                })
                .on('error', function (err, stdout, stderr) {
                    console.log('Cut error: ', err);
                    if(errorCallback!=null){
                        errorCallback();
                    }
                })
                .save(output);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
                errorCallback();
            }
        }
    }
    killCutAudioCommand() {
        if (this._cutAudioCommand) {
            this._cutAudioCommand.kill();
        }
    }

    processAudioForMerge(input, output, opts, progressCallback,endCallback,errorCallback){
        this._mergeAudioCommand = ffmpeg()
            .input(input)
            .audioCodec('libmp3lame') //libmp3lame，libfaac，libvorbis，libfdk_aac
            .audioBitrate(opts.audioBitrate)
            .duration(Number((opts.duration/opts.speed).toFixed(3)));
        if(opts.speed!=1){
            if(opts.speed==0.25)
                this._mergeAudioCommand = this._mergeAudioCommand.audioFilters('atempo=0.5,atempo=0.5');
            else if(opts.speed==4)
                this._mergeAudioCommand = this._mergeAudioCommand.audioFilters('atempo=2,atempo=2');
            else
                this._mergeAudioCommand = this._mergeAudioCommand.audioFilters('atempo='+opts.speed);
        }
        if(opts.volume!=1){
            this._mergeAudioCommand = this._mergeAudioCommand.audioFilters('volume='+Number(opts.volume.toFixed(2)));
        }
        if(opts.audioBitrate!=null){
            ffmpegCommand=ffmpegCommand.outputOptions(['-b:a',opts.audioBitrate+'k']);
        }
        if(opts.audioSampleRate!=null){
            ffmpegCommand=ffmpegCommand.audioFrequency(opts.audioSampleRate);
        }
        if(opts.audioChannel!=null){
            ffmpegCommand=ffmpegCommand.audioChannels(opts.audioChannel);
        }
        this._mergeAudioCommand = this._mergeAudioCommand
            .on('progress', function (progress) {
                //console.log('Processing: ' + progress.percent + '% done');
                if(progressCallback!=null){
                    progressCallback(progress);
                }
            })
            .on('end', function (stdout, stderr) {
                console.log('Processing succeeded!');
                if(endCallback!=null){
                    endCallback();
                }
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Processing error: ', err);
                if(errorCallback!=null){
                    errorCallback();
                }
            })
            .save(output);
    }
    mergeAudio(output,concatFileContent,endCallback,errorCallback){
        this._mergeAudioCommand = ffmpeg()
            .outputOptions(['-i','concat:'+concatFileContent,'-acodec','copy'])
            .on('end', function (stdout, stderr) {
                console.log('Merge succeeded!');
                if(endCallback!=null){
                    endCallback();
                }
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Merge error: ', err);
                if(errorCallback!=null){
                    errorCallback();
                }
            })
            .save(output);
    }
    killMergeAudioCommand() {
        if (this._mergeAudioCommand) {
            this._mergeAudioCommand.kill();
        }
    }

    compressAudio(input, output, opts, progressCallback,endCallback,errorCallback){
        try{
            var ffmpegCommand = ffmpeg(input)
            if(opts.audioBitrate!=null){
                ffmpegCommand=ffmpegCommand.outputOptions(['-b:a',opts.audioBitrate+'k']);
            }
            if(opts.audioSampleRate!=null){
                ffmpegCommand=ffmpegCommand.audioFrequency(opts.audioSampleRate);
            }
            if(opts.audioChannel!=null){
                ffmpegCommand=ffmpegCommand.audioChannels(opts.audioChannel);
            }
            ffmpegCommand = ffmpegCommand
                .on('start', function (commandLine) {
                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('progress', function (progress) {
                    //console.log('Processing: ' + progress.percent + '% done');
                    if(progressCallback!=null){
                        progressCallback(progress);
                    }
                })
                .on('end', function (stdout, stderr) {
                    console.log('Transcoding succeeded!');
                    if(endCallback!=null){
                        endCallback();
                    }
                })
                .on('error', function (err, stdout, stderr) {
                    console.log('Cannot process: ', err);
                    if(errorCallback!=null){
                        errorCallback();
                    }
                })
                .save(output);

            if(this._compressAudioCommandArr==null)
                this._compressAudioCommandArr=[];
            this._compressAudioCommandArr.push(ffmpegCommand);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
                errorCallback();
            }
        }
    }
    killCompressAudioCommand(){
        for(var i=this._compressAudioCommandArr.length-1;i>=0;i--){
            this._compressAudioCommandArr[i].kill();
            this._compressAudioCommandArr.splice(i,1);
        }
    }
    
    audioFormatConvert(input, output, opts, progressCallback,endCallback,errorCallback){
        try{
            var ffmpegCommand = ffmpeg(input);
            if(opts.vn){
              ffmpegCommand=ffmpegCommand.outputOptions(['-vn']);
            }
            if(opts.audioBitrate!=null){
                ffmpegCommand=ffmpegCommand.outputOptions(['-b:a',opts.audioBitrate+'k']);
            }
            if(opts.audioSampleRate!=null){
                ffmpegCommand=ffmpegCommand.audioFrequency(opts.audioSampleRate);
            }
            if(opts.audioChannel!=null){
                ffmpegCommand=ffmpegCommand.audioChannels(opts.audioChannel);
            }
            ffmpegCommand = ffmpegCommand
                .on('start', function (commandLine) {
                    console.log('Format conversion start: ' + commandLine);
                })
                .on('progress', function (progress) {
                    //console.log('Processing: ' + progress.percent + '% done');
                    if(progressCallback!=null){
                        progressCallback(progress);
                    }
                })
                .on('end', function (stdout, stderr) {
                    console.log('Format conversion succeeded!');
                    if(endCallback!=null){
                        endCallback();
                    }
                })
                .on('error', function (err, stdout, stderr) {
                    console.log('Cannot process: ', err);
                    if(errorCallback!=null){
                        errorCallback();
                    }
                })
                .save(output);

            if(this._audioFormatConvertCommandArr==null)
                this._audioFormatConvertCommandArr=[];
            this._audioFormatConvertCommandArr.push(ffmpegCommand);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
            errorCallback();
            }
        }
    }
    killAudioFormatConvertCommand(){
        for(var i=this._audioFormatConvertCommandArr.length-1;i>=0;i--){
            this._audioFormatConvertCommandArr[i].kill();
            this._audioFormatConvertCommandArr.splice(i,1);
        }
    }
}