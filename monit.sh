#!/bin/sh
pid=`ps -ef|grep "node"|grep "auto-lable.js" |grep -v grep |wc -l`
if [ $pid -eq 0 ] ; then 
	killall -9 auto-lable
fi
nohup node /home/singku/test-auto-lable/auto-lable.js >/dev/null 2>&1 &

