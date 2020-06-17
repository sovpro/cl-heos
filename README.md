# CL-HEOS

A command-line utility to command a HEOS device.

```
npm i -g @sovpro/cl-heos

cl-heos --help

Usage: cl-heos <command> <params...>
       cl-heos --help [<command>] | <command> --help

       required: --host or set HEOS_HOST in environment
       optional: --port or set HEOS_PORT in environment
                 --limit-props prop [...prop]

       Tip: Set CL_HEOS_<parameter name> in environment to set a default
            example: export CL_HEOS_RANGE=0,4 # sets default for: --range
                     export CL_HEOS_PID=123456789 # sets default for: --pid

       cl-heos get-players

       cl-heos get-player-info --pid ..

       cl-heos get-play-state --pid ..

       cl-heos set-play-state --pid .. --state ..

       cl-heos get-now-playing-media --pid ..

       cl-heos get-volume --pid ..

       cl-heos set-volume --pid .. --level ..

       cl-heos volume-up --pid .. --step ..

       cl-heos volume-down --pid .. --step ..

       cl-heos get-mute --pid ..

       cl-heos set-mute --pid .. --state ..

       cl-heos toggle-mute --pid ..

       cl-heos get-play-mode --pid ..

       cl-heos set-play-mode --pid .. --repeat .. --shuffle ..

       cl-heos get-queue --pid .. --range ..

       cl-heos play-queue-item --pid .. --qid ..

       cl-heos remove-from-queue --pid .. --qid ..

       cl-heos save-queue --pid .. --name ..

       cl-heos clear-queue --pid ..

       cl-heos move-queue-item --pid .. --sqid .. --dqid ..

       cl-heos play-next --pid ..

       cl-heos play-previous --pid ..

       cl-heos get-music-sources

       cl-heos get-source-info --sid ..

       cl-heos browse-source --sid .. --range ..

       cl-heos browse-source-containers --sid .. --cid .. --range ..

       cl-heos get-source-search-criteria --sid ..

       cl-heos browse-search --sid .. --search .. --scid .. --range ..

       cl-heos play-station --sid .. --cid .. --mid .. --pid .. --name ..

       cl-heos play-preset-station --pid .. --preset ..

       cl-heos play-input-source --pid .. --input ..

       cl-heos play-input-source-from --pid .. --spid .. --input ..

       cl-heos play-url --pid .. --url ..

       cl-heos add-container-to-queue --sid .. --cid .. --aid .. --pid ..

       cl-heos add-track-to-queue --sid .. --cid .. --mid .. --aid .. --pid ..

       cl-heos get-heos-playlists --range ..

       cl-heos get-heos-favorites --range --

       cl-heos rename-heos-playlist --sid .. --cid .. --name ..

       cl-heos delete-heos-playlist --sid .. --cid ..

       cl-heos get-heos-history --type .. --range ..

       cl-heos retrieve-metadata --sid .. --cid ..

       cl-heos set-service-option --sid .. --option .. --pid ..

```

## Links

* [HEOS by Denon](https://usa.denon.com/en/heos)
* [HEOS CLI Protocol Specification](https://denon-uk.custhelp.com/app/answers/detail/a_id/5744/~/heos-control-protocol-\(cli\))

# Notice

This unsponsored software is provided, subject to a MIT license, unofficially and independently of Sound United, LLC, its affiliates, subsidiaries and brands (such as HEOS, Denon and any such not listed here).
