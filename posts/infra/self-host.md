Title: Stop going to the cloud and getting scammed. $200 infra to serve your startup till 100k monthly users in 15 minutes. Self-hosted Postgres, caddyserver and docker-compose FTW.
Description: An example of how you can save money, simplify your architecture and speed up the development by going back to the basics and ditching the cloud, kubernetes and whatnot.
Date: 2023-10-20
Authors: Olaf Górski
Slug: self-host
Language: en
## STOP DOING CLOUD

This will be a feisty juicy article, a bit controversial. I think more than a half of the users of the cloud/kubernetes would be better off without it. AWS should stand for `how to have people pay for our infra we need once per year during black friday and actually make money out of it`. Declouding is a nice trend I'm seeing now. 37signals have some good stuff on it. I'll ad my share as to why what has once been something cool has evolved into an abomination that often adds more complexity and problems than it brings, at least for some people. 

```
![meme about the cloud](https://grski.pl/static/articles/cloud/fools.png)
```

Sure it has it's uses at a certain scale and so on. The problem is almost no one is at such a scale and never will be, but we are blindly following a trend, pretending it's not the reality. 

Why not try... Simplicty? Boring old stuff that just works, is easily debuggable and that even one person can grasp? 

No your startup with 100k monthly users probably doesn't need all the stuff AWS excells at. To be honest most of you will be fine running a single dedicated bare-metal server.

Cloud pricing is unclear often, performance is not that dependable, especially on shared resources. To bring down costs you need to often sign up for long-term plans. So on so forth. Layers of abstractions upon abstractions.

I still do use the cloud in some of my work, but there's an alternative people have forgotten about - actually hosting your shit. Owning your data. Your architecture. Everything. Today I'll show you an example how we can do that. In this article we will go through setting up a self-hosted postgres instance, replicated/scalable API, load balancer, automatic ssl management, simple deployment that can be automated in 10 minutes and lastly, we will do that for under $200 per month and within 15 minutes. With this setup in some cases I'd argue you can handle up to 1M monthly active users without a hitch. See why the cloud providers and gurus have...

## They have played us for absolute fools.

In the article I assume you have a server running somewhere. Preferable a dedicated one. In my case it's 80 core 128 gb hetzner, that I got for $200 per month.

Before starting let's install some utils we will need and update our server.

```bash
sudo apt update && sudo apt upgrade
sudo apt install gnupg2 wget vim ca-certificates curl gnupg lsb-release

```

## Installing postgres

### Installing needed packages

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo apt-get --purge remove postgresql postgresql-* # IF YOU HAD POSTGRES PREVIOUSLY
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Let's quickly walk through what we did here. We've added newest postgres repos so that our server knows what and where to install from. In case of ubuntu 22.04, the default postgres version that the distro repos come with is postgres 14. We want the new fancy shiny stuff, so we had to make that extra step.

Then, we optionally uninstall previous postgres versions. I doubt you had any, but adding this step as it might be helpful for some of you. Be careful though. That `--purge` thing will purge a lot of stuff. Your data from databases included. If you want to ugprade from existing postgres installation, this guide is not for you.

After that we update our sources and install postgres + some needed packages. 

Lastly we start the postgresql service and make it enabled - so it boots after startup. 

Now, we have to... Well, actually that's it. AWS marketers have done a good job in making you think installing and running a database was hard and a complex task. In some cases it is, indeed. But for the average IT Joe/startup? I wouldn't say so.

### Creating new database and user

Now we need to do a little bit of setup on our database. In order to do that, let's connect to it using `psql`. How?

```bash
sudo -u postgres psql
```

now you should see something like:

```bash
psql (16.0 (Ubuntu 16.0-1.pgdg22.04+1))
Type "help" for help.

postgres=#
```

Boom. There we are. To test if our efforts in installing the newest postgres version have not failed, type:

```sql
psql (16.0 (Ubuntu 16.0-1.pgdg22.04+1))
Type "help" for help.

postgres=# SELECT version();
                                                              version
-----------------------------------------------------------------------------------------------------------------------------------
 PostgreSQL 16.0 (Ubuntu 16.0-1.pgdg22.04+1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, 64-bit
(1 row)
```

As you can see, `PostgreSQL 16.0 `. Congrats, we made it brahs. 

Currently you are inside your postgres, running as the default allmighty postgres user on postgres database. Now - we DO NOT EVER want to run our apps on this database. Don't be a lazy bum. It's a big security breach potentailly. So what do we do instead one might ask? That is a trivial question - we need to create a seprate database and a separate user for that database. Usually you have separate db (or multiple dbs actually) for an app/service couple with user just for that db.

That way if someone ever manages to break into your DB, in case you are hosting multiple dbs with data from multiple apps, they only get access to that one particular db. Is it hard? Nope. Check this out:

```sql
postgres=# CREATE DATABASE yourdbname;
CREATE DATABASE
postgres=# CREATE USER youruser WITH ENCRYPTED PASSWORD 'yourpass';
CREATE ROLE
postgres=# GRANT ALL PRIVILEGES ON DATABASE yourdbname TO youruser;
GRANT
postgres=# ALTER DATABASE yourdbname OWNER TO youruser;
ALTER DATABASE
```

We created a new user with a particular password, created a new database. Then we assigned the user privilages to perform all operations on said database, but only on that database.

The last line is needed because we created the database as the postgres user. Which means that while the user can perform actions on the database, he can only perform actions on the database objects that are his own. Because we created the database as the postgres user, and during db creation it gets created with some default schemas/tables, by default the owner of these is the user that created it. In our case - postgres. So other than allowing our new user to perform any action on the said database, we need to now make him an owner of the stuff that's already existing in the database so he can modify it too if needed, and it will be. 

By the way interesting concept right? Even when you create an empty database, it's already populated with some stuff, so it ain't empty. IT, right?

That's pretty much it. Or is it? 

### Connecting to postgres from outside of localhost

Postgres, by default, only allows you to connect to itself from localhost/local machine to simplify. Meaning - any connections from other ips, networks etc. will be rejected. It's a very needed security measure that prevents random people from the internet to try and brute force their way into your database. That is the last thing you want.

However we live in a world where everything is running in a container. Containers have their own networks (usually) and when we make requests from inside of the container, the network we are in will be a bit different, meaning we won't be 'marked' as localhost, which in turn currently will make postgres reject our connection, even if we specify correct credentials.

I know it may sound tricky - how come, we are on the same machine, local machine. Why is our request treated as it isn't? This relats to how docker, containers and their networking works. Docker has it's own private network for all the stuff it does, sometimes sharing it with the host (in the host network mode) or having a 'bridge' that acts as a, well, bridge, between the local network and docker network, which allows you to, for example, call services hosted on the host machine, from within docker container.

This way you can have multiple docker containers or docker-composes running, some of which internally are using the same ports, without conflicts and so on. They are usually put in other networks created eg. per docker-compose (unless you specify otherwise).

It's a great thing, however in this case it complicates stuff for us, but not by much. What do we have to do?

Well, first of all, install docker! It'll come in handy, right?

## Installing docker on ubuntu 22.04

First off, again - if you tried to install something before hand you might want to do this to purge everything and have a clean slate. Again - be careful.

```bash
sudo apt remove docker-desktop
rm -r $HOME/.docker/desktop
sudo rm /usr/local/bin/com.docker.cli
sudo apt purge docker-desktop
```

Once we have that, we will add new sources to our repos, this time for docker, similarly as we did for our postgres.

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

Now, let's see what versions are available to us:

```bash
apt-cache madison docker-ce | awk '{ print $3 }'
5:24.0.6-1~ubuntu.22.04~jammy
5:24.0.5-1~ubuntu.22.04~jammy
5:24.0.4-1~ubuntu.22.04~jammy
5:24.0.3-1~ubuntu.22.04~jammy
5:24.0.2-1~ubuntu.22.04~jammy
5:24.0.1-1~ubuntu.22.04~jammy
5:24.0.0-1~ubuntu.22.04~jammy
5:23.0.6-1~ubuntu.22.04~jammy
5:23.0.5-1~ubuntu.22.04~jammy
5:23.0.4-1~ubuntu.22.04~jammy
5:23.0.3-1~ubuntu.22.04~jammy
5:23.0.2-1~ubuntu.22.04~jammy
5:23.0.1-1~ubuntu.22.04~jammy
(...)
```

I decided to go with the newest one, if you for some reason want to install another, feel free.

```bash
VERSION_STRING=5:24.0.6-1~ubuntu.22.04~jammy
sudo apt install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-compose-plugin
```

aaand done. Let's test our docker installation.

```bash
docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
719385e32844: Pull complete
Digest: sha256:88ec0acaa3ec199d3b7eaf73588f4518c25f9d34f58ce9a0df68429c5af48e8d
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

Seems to be working. How about `docker-compose`?

```bash
docker-compose
Command 'docker-compose' not found, but can be installed with:
apt install docker-compose
```

Not there, weird? Nope. Some of you might be still used to the old `docker-compose` thingy, however some time ago it got moved to be a part of the docker itself, which means that now instead of `docker-compose` you do:

```bash
docker compose

Usage:  docker compose [OPTIONS] COMMAND

Define and run multi-container applications with Docker.
```

Alright! We set. Almost.

Currently, if you sshed on a clean server, which I assume you did, you are running as the root user. You can check this by typing:

```bash
whoami
root
```

The problem with that is similar to the situation with our postgres and the almighty postgres user. 

Ideally, we do not want to run our containers as root, to prevent attackers from being able to do bad stuff to the whole server. Let's create a new user where we will be running our containers. You can have user per app or service, but not sure if you need that. Just not running on root is usually good enough.

How?

### Running docker on non-user or rootless docker

That's all quite simple.

We need to create a new user, add it to the sudoers grup, set a password for it and lastly add it to the docker group. In our case we will create a prod user and then add it to the sudo group and docker group.

```bash
sudo useradd prod
sudo usermod -aG sudo prod
sudo passwd prod
sudo usermod -aG docker docker
```

That's quite much it for now.

### Enabling docker containers to connect to host postgres

The sane way. Some people deal with the issue described before, the one regarding connections from outside of localhost, by allowing `*` which means any and all networks/ips. This is a NO GO for production, really. The sane way is, as mentioned, to only allow specific networks. In our case docker network. How to do that?

We have to find out what is the local ip address that our docker network got assigned and simply allow traffic from that network to access. Sounds tricky, but ain't.

Now, before we proceed, I'm not that proficient in networking to be frank. Which means that my solution, while working, might not be the ideal one. Happy for feedback from someone more knowledgeable in the topic.

We want to add our docker network to those permitted inside our postgres. This implies we need to know the docker network address. How to get it?

```bash
ip addr | grep docker
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
```

`172.17.0.1` in this case is the network address we need. It'll probably be the same in your case, but doesn't have to be. Now that we have it, let's move on. How to edit postgres config?

First, my young padawan, we will need to find the location of our postgresql.conf file - which, surprisingly, is the file used to configure postgres.

We can do that with:

```bash
sudo find / -type f -name postgresql.conf
/etc/postgresql/16/main/postgresql.conf
```

In my case it's in `/etc/postgresql/16/main/postgresql.conf`. The probability of it being the same for you, if you are running ubuntu 22.04 and followed this guide, as the probability of us living in a simulation or being at the beginning of an AI bubble. Get back to the topic Olaf. Gosh.

Okay, we know where the file is, we need to edit it. Type in:
```bash
sudo vim /etc/postgresql/16/main/postgresql.conf
```

and look for `listen_addresses` part. In vim you can do a search by typing `/{phrase}` so `/listen_addresses` should navigate you to the proper line. In my case it looks like this:

```
#listen_addresses = 'localhost'         # what IP address(es) to listen on;
```

we need to uncomment the line and edit it so it allows connections from our docker network ip. So:

```
listen_addresses = "localhost,172.17.0.1"
```

then `:wq` and done.

Now we also need to edit `pg_hba.conf` to also allow this particular network to acces our database while authenticating with a password.

First let's find it:

```bash
sudo find / -type f -name pg_hba.conf
/etc/postgresql/16/main/pg_hba.conf
```

and edit it with:

```bash
sudo vim /etc/postgresql/16/main/pg_hba.conf
```

now again, navigate to a section containing "IPv4 local connections":

```bash
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256

```

we need to edit the IPv4 section to look like this:

```bash
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             172.17.0.0/16           scram-sha-256
```

What does the /16 after the netowrk address mean? Match the first 16 bytes of the address, so the 2 first. numbers, rest can change.

Now, let's restart our postgres.

``` bash
sudo /etc/init.d/postgresql restart
```

Important note. You might need to add something like this to your docker-compose:

```yaml
    extra_hosts:
      - "host.docker.internal:172.17.0.1"
```

For each service that will access it, and edit the connection string for postgres host to be: host.docker.internal. Either that or just use 172.17.0.1 value directly.

With docker and postgres set up, the world is yours to take. But is this it? I wouldn't be myself if i just ended with this. Let's take it up a notch. I mean we usually want to have something in front of our API, some reverse proxy, maybe capability to scale, have multiple replicas and so on. Performance and scaling stuff. Simple solution for that too.

## BUT MUH SCALABILITY, LOAD BALANCING, SSL and whatnot

Ye I hear you, all the folks with 1k monthly active users, serving up to 2 requests per second, usually screaming about scalability the loudest. WHERE"S KUBERNETES? WHERE"S MY CLOUD SCALING STUFF, REEE!!one! AND THE DEVOPS TEAM? ARE YOU A FOOL?

I'll give you some love too, fret not.

For the database, the case is simple. With a dedicated bare metal server that I recommend you get, unless you do some horrendeous things in the schema or query, well, you can handle TONS of data & traffic on a single machine.With just one instance of $200 ARM Hetzner with 80 dedicated cores, 128 GB of RAM, 2TB NVME PCIe SSD, how much more do you need in most cases? 

Yeah, availability zones and so on, but let's take a step back. How many of you are truly running multi region & multi availability zones DB deployments? HMMM? Thought so. Sorry to break it to you, but hype/conference driven development isn't the only way to go. I'd argue that at least 90-95% of current startups could probably run just fine with this single instance only. Okay, maybe some of you would need something like S3 (Cloudflare R2 maybe?). Outgrowing this setup will probably mean you already got enough tracton, customers and money to actually start your own colocation thingy with a dedicated team. Backups? Survavibility? We'll talk about that part later.

So, in this post, we won't cover how to horizontally scale the db, as I think it's simply not needed for the audience i target this too. What is needed though, is probably replication of the apis/scaling them and then reverse proxy/managing ssl/load balancing. That's what we will do. Let's start with replicating our api to an arbitrary size. How can we do that?

Docker-compose lol.

## Ditch Kubernetes, docker compose for the win

This part will be quite short, sweet and simple. Probably not many of you know, but docker compose supports replication out of the box. Why wouldn't it. How do we go about it?

```yaml
  api:
    build:
      context: .
    depends_on:
      database:
        condition: service_healthy
    restart: always
    deploy:
      replicas: 4
    ports:
      - "8000-8003:8000"
```

the key part here being:

```yaml
    deploy:
      replicas: 4
    ports:
      - "8000-8003:8000"
```

after that, just do `docker compose up`. And then boom. You done. Multiple replicas of your api service up and running. With 4 lines of code, 2 of them you already probably have in your code.

Remember what we said - we do not want to run docker as root, so ssh/login into the user we created `prod` for this purpose.

once you there, just clone the repo and docker compose up.

You'll be amazed how fast the deployments can happen. Also about the secrets. 1password offers some nice options here for such use cases, or in fact, you can even just create .env file, specify it in the docker-compose and be done with it.

Logs can be easily checked with a simple `docker compose logs` + docker saves them to a file iether way.

But, what about load balancing, reverse proxy and ssl stuff? 

## Load Balancing & automatic ssl with Caddyserver

We will use caddyserver to act as a reverse proxy, load balancer and to automatically take care of the certificates for us. It's a bit less performant than nginx, true, but the ease of use and convenience it provides is well worth it. That plus usually it's not the proxy that will die first. Quite the opposite.

So how do we go about this? Probably complicated? Nope.

We will let ansible handle all the work for us. Ansible? Yes, you read that right. Not terraform.

In order to do that we will need to create a new user for our ansible to run on, enable ssh access and do a bit of ansible dev. Let's go. You already know the drill.

```bash
sudo useradd ingres
sudo passwd ingres
sudo usermod -aG sudo ingres
```

Now, a small change to what we did before.

We make sure our user can do sudo operations without password. How?

```bash
visudo
```

then find this piece:

```bash

# User privilege specification
root    ALL=(ALL:ALL) ALL

```

and add this below (or at the bottom of the file):

```bash
ingres ALL=(ALL) NOPASSWD: ALL
```

We could be more granular about permissions here and what it has access to, but that could come in a 2nd iteration, I consider this good enough.

Let's enable SSH access now. This might not be needed on your machine, depends on the server. I had to do it on my hetzner.

We need to edit the sshd_config file. How to find where it is? You should know by now ;) 

```bash
vim /etc/ssh/sshd_config
```

and find something like this:

```bash
#AuthorizedKeysFile      .ssh/authorized_keys
```

turn it into:

```bash
AuthorizedKeysFile      .ssh/authorized_keys
AllowUsers root prod dev
```

add your ssh key to `/home/ingres/.ssh/authorized_keys` in order to do that and eg. add the same ssh key you use for your root account (not ideal):

```bashand lastly:
su ingres  # we switch the user to make it the owner of the directory we create
mkdir -p /home/ingres/.ssh
cat ~/.ssh/authorized_keys > /home/ingres/.ssh/authorized_keys
```

aaand lastly:

```bash
service sshd restart
```

Setup done. Time to install caddy with ansible. But before that, we need to setup ansible.

I'll assume you have pyenv installed and set up running on your local machine. You can read about that [here](https://grski.pl/pyenv-en) in my article, or [here](https://grski.pl/pdf-brag).

With that we can:

```bash
pyenv virtualenv 3.11 infrastructure-deployment-3-11
mkdir infrastructure-deployment
cd infrastructure-deployment
pyenv local infrastructure-deployment-3-11
python -m pip install ansible
```

Pyenv set up. Ansible set up. We will need one more thing - install custom role from ansible galaxy.

```bash
python -m ansible galaxy role install caddy_ansible.caddy_ansible  
```

Now inside our `infrastructure-deployment` directory on our local machine create a file called `inventory.yml`

```yaml
all:
  hosts:
    bare-metal-hetzner:
      ansible_host: "your-host-ip"
      ansible_user: "ingres"
      ansible_port: 22
```

aaand `caddy_install.yml`:

```yaml
---
- name: Install Caddy Server
  hosts: all
  become: true
  roles:
     - role: caddy_ansible.caddy_ansible
       caddy_conf_filename: Caddyfile
       caddy_update: true
       caddy_systemd_capabilities_enabled: true
       caddy_systemd_capabilities: "CAP_NET_BIND_SERVICE"
       caddy_config: |
        your-fancy-startup-domain.com {                 
          # Compress responses according to Accept-Encoding headers
          encode gzip zstd
          
          # Send API requests to backend
          reverse_proxy 127.0.0.1:8000 127.0.0.1:8301 127.0.0.1:8302 127.0.0.1:8303
        }

```

run 

```bash
python -m ansible playbook -i inventory.yml caddy_install.yml   
```

aaand done.

Now if you go to your-fancy-startup-domain.com, given that proper docker containers are running, you'll get them.

Automatic SSL. Automatic load balancing. EVERYTHING WORKS.

## BACKUPS, SURVAVIBILITY

You can have hourly backups with BorgBackup. How? Brilliant tutorial can be found in [hetzner docs](https://community.hetzner.com/tutorials/install-and-configure-borgbackup). Go read them.

On top of that add $4 1 TB [Hetzner Storage Box](https://www.hetzner.com/storage/storage-box) linked to your server. Boom. Done. You might want to think about adding pg_dump, but IMO just the BorgBackup for starters is ok.

My borg-backup script looks more or less like this:

```bash
	#!/bin/sh
# First init the repo
# ssh -p23 ssh://xxxxx.your-storagebox.de mkdir /home/backup
# ssh -p23 ssh://xxxxx@xxxxx.your-storagebox.de mkdir /home/backup/main
# borg init --encryption=repokey ssh://xxxxx@xxxxx.your-storagebox.de:23/~/backup/main
# Setting this, so the repo does not need to be given on the commandline:
export BORG_REPO=ssh://x@x.your-storagebox.de:23/~/backup/main

# See the section "Passphrase notes" for more infos.
export BORG_PASSPHRASE=

# some helpers and error handling:
info() { printf "\n%s %s\n\n" "$( date )" "$*" >&2; }
trap 'echo $( date ) Backup interrupted >&2; exit 2' INT TERM

info "Starting backup"

# Backup the most important directories into an archive named after
# the machine this script is currently running on:

borg create                         \
    --verbose                       \
    --filter AME                    \
    --list                          \
    --stats                         \
    --show-rc                       \
    --compression lz4               \
    --exclude-caches                \
    --exclude 'home/*/.cache/*'     \
    --exclude 'var/tmp/*'           \
    --exclude '*__pycache__*'       \
    --exclude '*.pyenv*'            \
                                    \
    ::'{hostname}-{now}'            \
    /etc                            \
    /home                           \
    /root                           \
    /var

backup_exit=$?

info "Pruning repository"

# Use the `prune` subcommand to maintain 7 daily, 4 weekly and 6 monthly
# archives of THIS machine. The '{hostname}-*' matching is very important to
# limit prune's operation to this machine's archives and not apply to
# other machines' archives also:

borg prune                          \
    --list                          \
    --glob-archives '{hostname}-*'  \
    --show-rc                       \
    --keep-daily    7               \
    --keep-weekly   4               \
    --keep-monthly  6

prune_exit=$?

# actually free repo disk space by compacting segments

info "Compacting repository"

borg compact

compact_exit=$?

# use highest exit code as global exit code
global_exit=$(( backup_exit > prune_exit ? backup_exit : prune_exit ))
global_exit=$(( compact_exit > global_exit ? compact_exit : global_exit ))

if [ ${global_exit} -eq 0 ]; then
    info "Backup, Prune, and Compact finished successfully"
elif [ ${global_exit} -eq 1 ]; then
    info "Backup, Prune, and/or Compact finished with warnings"
else
    info "Backup, Prune, and/or Compact finished with errors"
fi

exit ${global_exit}
```



To run it periodically type in `crontab -e`

and then

```bash
00 2 * * * /root/borg-backup.sh
```

## Potential improvements

Ofcourse the permissions here and there could be more fine-grained for sure. 

We could also add a bastion in front of the server. 

Automate the deployment so that after each merge stuff gets built & deployed. 

Add monitoring, observability, alerts. (Ain't that hard tbh, we will explore that one day)

There's much more than that ofcourse but these are the starters.

## Summary

We have set up: 

1. self-hosted postgres instance with passable initail configuration
2. replicated api-service with as many replicas as we want
3. proper load balancing and reverse proxy in front of them
4. https everywhere
5. proper certifcates, all handled automatically
6. 1 click deployment of our reverse proxy
7. blazing fast deployments/build times in the future (for now manual, but can easily be automated)
8. ability to potentially handle hundreds of thousands of users
9. very predictable cost & performance
10. regular FULL backups
11. no additional deployment code
12. Absolutely stunning performance with 80 dedicated cores, 128 gb of ram, 2 TB NVMe SSD (you'd be amazed)

What more can I say. Cloud IS NOT the solution for everything. Sometimes you can try the alternative path.

Similar setup on AWS would be probably $6-10k upwards just for the postgres. That plus it wouldn't match the performance we have here. One thing not covered here is how much performance you gain when all the services are within one network. No calls outside your network == blazing fast shit.

All of this in 15 minutes and for $200 monthly. 

Want some copium cloud bro? 

Ofcourse this doesn't adhere to some of you and your companies, but you know that. I've simplified lots of things or generlised. However, for the general public and their needs, I think it's worth rethink the whole cloud sometimes.