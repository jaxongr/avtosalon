#!/usr/bin/expect -f
set timeout 30
set host "5.189.141.151"
set user "root"
set pass "P3h2c5t4F"
set cmd [lindex $argv 0]

spawn ssh -o StrictHostKeyChecking=no $user@$host $cmd
expect {
    "*assword*" {
        send "$pass\r"
        expect eof
    }
    eof
}
