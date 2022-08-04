import JSON5 from 'json5';
import { exec, execSync } from 'child_process'
import fs from 'fs';
const keys = ['refactor', 'fix', 'perf', 'feat']

function getLog() {
    const END_TAG = '--END--'
    const SEPARATOR_TAG = '--SEPARATOR--'
    const cmd = `git log --after="2022-1-3"  --no-merges --date=format:"%Y-%m-%d %H:%M:%S"  --pretty=format:"%B${SEPARATOR_TAG}%cd${SEPARATOR_TAG}%h${SEPARATOR_TAG}%H${END_TAG}"`
    const logString = execSync(cmd).toString().trim();
    const log = logString.split(END_TAG);
    // 删除最后一行空数据
    log.pop();
    const list = [];
    for (const row of log) {
        const oneLogArray = row.split(SEPARATOR_TAG);

        // 删除描述中开头结尾的\n
        oneLogArray[0] = oneLogArray[0].replace(/^\n/, '').replace(/\s*$/, '');
        const [message, time, shortHash, hash] = oneLogArray;
        const oneLog = { message, time, shortHash, hash };
        for (const key of keys) {
            if (message.includes(key)) {
                // 标记类型(fix/feat...)
                oneLog.type = key;
            }
        }
        list.push(oneLog);
    }
    return list
}

function _groupLogByTime(log) {
    // 分组
    const group = {};

    // 遍历数据到组
    for (const row of log) {
        const { time, message } = row;
        if (void 0 === group[time]) {
            group[time] = {};
        }
        // 填充数据
        let pass = false;
        for (const key of keys) {
            if (message.includes(key)) {
                group[time][key] = group[time][key] || [];
                group[time][key].push(row);
                pass = true;
                break;
            }
        }

        if (!pass) {
            group[time] = null;
        }

    }
    return group;
}

function genMD(group, title = '更新日志') {
    const md = [`# ${title}`];
    console.log(group);
    for(const row of group)
    return;

    if (group.feat.length) {
        md.push(`## 新增功能(${group.feat.length}项)`);
        for (const { message } of group.feat) {
            md.push(message);
        }
    }

    if (group.refactor.length) {
        md.push(`## 功能重构(${group.refactor.length}项)`);
        for (const { message } of group.refactor) {
            md.push(message);
        }
    }

    if (group.perf.length) {
        md.push(`## 功能优化(${group.perf.length}项)`);
        for (const { message } of group.perf) {
            md.push(message);
        }
    }
    if (group.fix.length) {
        md.push(`## 修复Bug(${group.fix.length}项)`);
        for (const { message } of group.fix) {
            md.push(message);
        }
    }

    fs.writeFileSync('test.md', md.join('\n'))
}


const g = getLog()
const group = _groupLogByTime(g);
genMD(group)




