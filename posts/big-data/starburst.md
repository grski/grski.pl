Title: Deploying Starburst on GCP with Hive, Storage and Postgres connectors.
Date: 2020-11-13
Authors: Olaf Górski
Language: en
Slug: starburst-k8s
Description: How to run popular query engine on Google Cloud Platform's Kubernetes Engine, while also adding connectors for GCS and Postgres - beginners guide.

Hello folks, grski here. Today we are in for some Ops/Big Data fun instead of the usual plain old Python. Why is that?

For the past year and a half, I've immersed myself in work that was related to designing/implementing APIs mostly with some of Product Ownership/Management/Mentoring on the side. The challenge in the projects/products that I've worked on was understanding business context mostly and client-facing requirements work. Technologically speaking, nothing advanced usually, or should I say: nothing interesting. Plain old Django + DRF, both of which are amazing, but you know. Stuff gets boring, especially on a small scale. So while I've developed myself when it comes to manager/product owner knowledge, my tech skills have stagnated. 

I've noticed that and decided to change this so STUFF ISN"T SO BORING ANYMORE, GOSH. The text that you are reading is the result of this - me trying out new stuff and learning things completely outside my usual specialization/comfort zone. Without further ado, let's get on with the technical stuff, but first let me make a small note here: the solutions shown in this article, are not perfect probably, almost certainly. I'm a newbie in this topic, who just sat down to it today and started doing things. This should NOT be inspiration to anything production-related. Also, I make some things simplified as the target for this article are greenhorns like me or even non-technical people, so bear with me. 

## Data is monnies

So what's this Starburst Enterprise for Presto thing? Why is it important? 

Nowadays we like in the age of data basically. Data == money quite often. Most of us want more monnies, right? So do all the different companies around the globe. Companies, that often have loads of data that they don't know how to use. Okay, data == money, but just selling it, is the fool's way. Sometimes the better approach is to do some numbers crunching on that data, do some analytics, gather insights and then act on them. This is where the potential to make a killing lies, this is where the miracle happens. Stuff like influencing the US elections, voting certain people out, predicting outburst of a pandemic or how it'll spread. What ties these things together? Data. 

Okay, so now we know that data is very important and all, right? Right. Great. Now think about it - all of that data must be stored somewhere and it indeed is. Usually in some kind of a database.

### Where does Presto fit into this?

The de-facto standard in the industry, for dealing with that data, understanding it, running some queries, is SQL. It's kind of a language you can say, a language that databases understand, that tell them what to do with the data that we have. Almost everyone in the data world knows it, it's not THAT hard, it's been with us for years, so it's battle-tested. It's magnificent. So far so good, stuff is nice and easy.

Here comes the boom though. SQL and relational databases are not the only thing out there, nor should they be. They are good in certain use cases, in other ones not so much. Let's call these our `other data sources`. In some applications you'll find dozens of these data source types, some of which do not understand SQL at all, making it way harder to process them together with traditional DB data, to gather insights and so on.

Here comes this [PrestoSql](https://prestosql.io/) (now known as Trino) thing though. Ah, btw - it was developed by Facebook initially. What is it? Presto is a layer of abstraction unifying all these data sources. It lets you use SQL/queries on almost any type of data source. It takes a lot of hassle away from the developer, making things easier. It's also designed with scale in mind, which means that handling loads of data won't be an issue. How much is  `loads`, well basically petabytes or exabytes. Which is a lot. A lot lot. Now, thanks to Presto, you can query all these different data sources with SQL and scale your application to suit your needs, whatever you need to query gigabytes, terabytes or petabytes, all of that is a breeze.

###  And Starburst?

The part about Presto is clear, what about [Starburst](https://www.starburstdata.com/)? Well, basically it's a company that specializes in providing solutions with Presto engine, striving to be the best. They also provide a product with the same name, which is something like a gathering of cool `packages` for Presto, more `connectors` for new data sources, improvements to existing ones, better performance. In simple terms, this product is Presto on steroids and for example support if you need it. They have a couple of different "versions" of this software, in this article, we will be going through the [Starburst Enterprise](https://www.starburstdata.com/presto-enterprise/) version setup. 

### Kubernetes?

This one you just have to go and google yourself. 

## Let's get our hands dirty

So, let's start then. We will begin by setting up the project on GCP and all of that.

Except we won't. I'll not bore you with the details on how to download CLI, register at GCP and initialize you cli. Google has magnificent docs regarding this, so help yourself. I expect that you'll have:

1. Project created in your google cloud platform console.
2. CLI installed
3. Kubectl added to gcloud 
4. Project id set in config in the cli
5. Region set in the cli
6. Proper services enabled in google cloud.

Now, once you have all that done, we can roll with our cluster. To do that you need to:

```bash
gcloud container clusters create starburst
```

It'll probably take a few minutes to create the cluster. After it's done, you can see what was deployed eg. using

```bash
gcloud container node-pools list
gcloud compute instances list
```

The first command will list you all of your node-pools, which are like a `group` for the machines you'll have. It's a very simplified description but bear with me or learn k8s. As for the second one it lists all the `instances`, so the `machines/computers` that your cluster will run on. 

Okay, our cluster is more or less running. What to do now? Head over here to [Starburst's docs](https://docs.starburstdata.com/latest/kubernetes/deployment.html) and download the files listed at the beginning of the linked page. After that navigate to the place where you have these files and apply these configs to our k8s cluster. How?

```bash
kubectl apply -f service_account.yaml
kubectl apply -f role.yaml
kubectl apply -f role_binding.yaml
kubectl apply -f presto_v1_crd.yaml
kubectl apply -f operator.yaml
kubectl apply -f example_presto_v1_cr.yaml
```

After all of that is done, try:

```bash
kubectl get pods
```

which should get you all of your pods. 

```bash
NAME                                                    READY   STATUS    RESTARTS   AGE
pod/hive-metastore-example-presto-8fc4787d8-phg8d       0/1     Pending   0          27m
pod/hive-postgresql-example-presto-5694696897-6whjr     0/1     Pending   0          27m
pod/presto-coordinator-example-presto-798cb57c7-mrfx9   2/2     Running   0          27m
pod/presto-operator-549d58bd9f-9wrgd                    1/1     Running   0          27m
pod/presto-worker-example-presto-6dc67485f-czmbb        1/1     Running   0          27m
pod/presto-worker-example-presto-6dc67485f-dwfzd        1/1     Running   0          27m
pod/presto-worker-example-presto-6dc67485f-qst95        1/1     Running   0          27m
```



You should see a couple of pods running, some of them might have the status of `PENDING`. For now, that's all fine.

## The world is yours to take

So our Presto cluster is more or less running. It'd be good to access it though, right? A UI interface comes packed together with Starburst Enterprise, it exposes itself at the port 8080, therefore all we have to do is to expose it to the world. How to do that? Well, k8s has a solution for it - stuff like LoadBalancer and ingress?

What are they exactly? Just smart way of calling the service that faces the world and routes requests to proper resources. More or less. How should we do it? [K8s docs tell us how](https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/). Considering that my k8s knowledge is first of all, very very shallow, second of all rusty as hell, since I've last touched it 1.5 yrs ago, I tried doing it the naive way and creating a file called `lb.yml` inside the same catalogue that I had my other deployment files with contents of:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: loadbalancer
spec:
  selector:
    app: loadbalancer
  ports:
    - port: 8080
      targetPort: 8080
  type: LoadBalancer
```

If you know k8s even slightly, you should see what's wrong in this approach. Anyway. I've applied this deployment, the load balancer service got up properly, so far so good. I checked it using:

```bash
kubectl get services
```

You need to wait till your LB gets `external ip` column assigned. The IP that you see there is the one you should try connecting to. And I've tried just that, trying to connect to `<external ip of my lb>:8080` in my browser. That didn't work. I get an error right away. Weird. Let's try to connect just the ip without the port. That behaved differently. How? The connection was made but it just hanged till timeout. Interesting. That suggested to me that LB was working correctly, overall, but the config was wrong - the service tried to map our request to a resource that didn't exist. That part with `selector.app: loadbalancer` was wrong. I had to know what is the name of the resource that I need to point to. But which one to pick? I have a couple of pods already. Hm. Let's be smart here and do:

```bash
kubectl get all
```

This will list all of our resources, in my case:

```bash
NAME                                            TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)             AGE
service/example-presto                          NodePort    10.3.253.30    <none>        8080:31234/TCP      27m
service/hive-metastore-example-presto           ClusterIP   10.3.244.139   <none>        9083/TCP            27m
service/hive-postgresql-example-presto          ClusterIP   10.3.254.181   <none>        5432/TCP            27m
service/kubernetes                              ClusterIP   10.3.240.1     <none>        443/TCP             36m
service/presto-operator-metrics                 ClusterIP   10.3.241.122   <none>        8686/TCP,8383/TCP   27m
service/prometheus-coordinator-example-presto   ClusterIP   10.3.254.83    <none>        8081/TCP            27m
service/prometheus-worker-example-presto        ClusterIP   10.3.248.236   <none>        8081/TCP            27m

NAME                                                READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/hive-metastore-example-presto       0/1     1            0           27m
deployment.apps/hive-postgresql-example-presto      0/1     1            0           27m
deployment.apps/presto-coordinator-example-presto   1/1     1            1           27m
deployment.apps/presto-operator                     1/1     1            1           27m
deployment.apps/presto-worker-example-presto        3/3     3            3           27m

NAME                                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/hive-metastore-example-presto-8fc4787d8       1         1         0       27m
replicaset.apps/hive-postgresql-example-presto-5694696897     1         1         0       27m
replicaset.apps/presto-coordinator-example-presto-798cb57c7   1         1         1       27m
replicaset.apps/presto-operator-549d58bd9f                    1         1         1       27m
replicaset.apps/presto-worker-example-presto-6dc67485f        3         3         3       27m
```

Hmmmm. The UI was supposed to expose port 8080, riiight? Well, if you look this output through, you'll get: 

```bash
service/example-presto                          NodePort    10.3.253.30    <none>        8080:31234/TCP      27m
```

Gotcha. I now know the proper name of the resource I need to refer to, time to fix this and also get rid of the file holding the config - deploy the lb using just a command. Why? To try another way and learn more basically! 

But before I did that, maybe you'd like to try and kill/remove our previous load-balancer service? You don't need to do that theoretically if the name matches, but try it anyway. How? Google it this time. Anyways, to bring up the proper LB do this:

```bash
kubectl expose service/example-presto --port=8080 --target-port=8080 --name=load-balancer --type=LoadBalancer
```

Now, if you go to `<external ip of my lb>:8080` magic will happen.

## Let's do some queries

Okay, our Presto cluster is properly exposed, everything is fine and dandy. Let's connect to the cluster, maybe create some tables or query hive. Let's go. How to do that? Install Presto CLI. How? [Installing CLI for Starburst Enterprise Presto](https://docs.starburstdata.com/latest/installation/cli.html)

I won't get into that, as the docs are enough. Now, let's run:

```bash
presto --server <external ip of my lb>:8080 --user test
```

and we see:

```bash
presto>
```

SUCCESS! What do to now? Let's maybe query hive a bit? Just to check if it's working properly. Let's start with typing this command in presto console:

```
USE hive.default;
```

in my case it caused an error. If you head over to the UI wrapper for you Presto, and filter for `failed` queries, you'll be able to get more details about why it failed. In my case it was `connectivity` error. As if it couldn't connect or there was nothing to connect to. Hm... Remember that `PENDING` status we got after using `kubectl get pods`. Here lies the issue. Both hive's `metastore` and it's internal `postgres` were still pending. Something's wrong.

Getting logs with `kubectl get logs <pod name>` won't work since the pod hasn't even started yet, so it won't return anything insightful, but describing a pod should. How do those two differ? `kubectl get logs` is focused on the things outputted in the pod, while it's running. `kubectl describe pod` on the other hand will tell us more about the pod's configuration and stuff like that. Let's do it then.

```bash
kubectl describe pod <name of the pod with hive>
```

What did it return? Something along the lines of:

```bash
...
  Warning  FailedScheduling  43s (x2 over 43s)  default-scheduler  0/3 nodes are available: 3 Insufficient cpu.
  Warning  FailedScheduling  2m30s (x7 over 9m31s)  default-scheduler  0/3 nodes are available: 3 Insufficient cpu.
  Warning  FailedScheduling  97s (x6 over 116s)     default-scheduler  0/4 nodes are available: 4 Insufficient cpu.
...
```

Everything got clear.

## Plan your resources smartly

As you can see, our pod with `hive` and `postgres` couldn't get enough resources therefore it didn't start. What to do? Well, my initial idea was to just add more machines/scale the number of nodes. How to do that? You can read about that in google cloud docs. I increased the number of my nodes to 5, just in case. By default I had 3. 

Let's see now. `kubectl get pods` -> bang! Hive metastore started properly, but postgres... STILL PENDING, although in theory the node-pool still had lots of free resources. Wat to do? Let's dig with `kubectl describe pod <name of the pod with postgres for hive>` again.

```bash
...
    Requests:
      cpu:     2
      memory:  2Gi
...
  Warning  FailedScheduling  30s  default-scheduler  0/4 nodes are available: 1 Insufficient memory, 4 Insufficient cpu.
...

```

This part of the config got my attention. Why? Because I checked the machines on which our nodes run. They were of type `n1-standard-1` which means all of them had 1 vCPU and 1 GB of RAM. Now, it can be quite hard to run a pod that needs 2 vcpus and 2 gigs of ram on a machine with just 1 vcpu ang 1 gig of RAM. How do we deal with this? Well, we need to resize our instances. I have no idea if there are more sophisticated ways of doing that, but I settled for just deleting the old node pool and creating a new one with bigger machines. 

First - get the name of your node-pool

```bash
gcloud container node-pools list
```

and then delete your old one, while also creating a new one:

```bash
gcloud container node-pools delete <your node pool name>
# after it's done then create a new one:
gcloud container node-pools create starburst-pool --machine-type=n1-standard-4 --num-nodes=3
```

This will create a node-pool with the name of `starburst-pool`, running on machine type `n1-standard-4`, with 3 nodes, so 3 machines more or less. For the example deployment, you can also probably roll with just 2 nodes to save money, but I'd rather go with 3. Let's now see if our pods are running correctly.

```bash
NAME                                                 READY   STATUS    RESTARTS   AGE
hive-metastore-example-presto-75bcb5954b-vgcpj       1/1     Running   0          20m
hive-postgresql-example-presto-5694696897-bgshb      1/1     Running   0          21m
presto-coordinator-example-presto-7688499cb8-pxvbx   2/2     Running   0          20m
presto-operator-549d58bd9f-mbgn6                     1/1     Running   0          20m
presto-worker-example-presto-784f5db44-clxgp         1/1     Running   0          20m
presto-worker-example-presto-784f5db44-gxfnr         1/1     Running   0          20m
presto-worker-example-presto-784f5db44-wz98m         1/1     Running   0          20m
```

EVERYTHING IS WORKING, YAY!

Try the initial query that we did a while ago. It should work now. If it does, congrats. You hive with it's internal postgres is running correctly.

## External sources of data

Okay. We have the cluster set up finally. Everything is perfect. Except for one thing. We have no data to run queries against. Which is sad. Let's maybe load some. Why not?

How can we do that? Lots of ways, but let's go with one that's quite common: reading an ORC file from Object Storage Service. What is this? ORC is this format developed for big data basically. Performance reasons and so on - you don't have to bother yourself that much about it. Object Storage Service is something like Amazon's AWS S3 or Google Cloud Platform's Google Cloud Storage, which is basically a fancy way of saying that it's kind of a hard drive but in the cloud. 

I decided to roll with GCP's solution as to have everything in one place, plus I know S3 already, so let's try something new.

How to create a bucket? It's easy, google it. Then do the same with the information on how to create a service key. Just watch out to not create a public bucket as then all your files will be available on the internet. Also maybe try to limit the access you give to your service key. Research more about these two topics on your own. 

Once you have a service key generated, download it's .json file. You have it? Great. Let's proceed.

### Object Storage Service - GCS

Do you remember this file `example_presto_v1_cr.yaml` that we downloaded before? Open it in some kind of text editor/IDE, find the `hive` section. In my case it looks like that:

```bash
  hive:
    internalMetastore:
      image:
        pullPolicy: Always
      internalPostgreSql:
        enabled: true
      memory: 0.5Gi
      cpu: 0.5
```

What we need to do here is to allow hive to somehow authorize with GCP. How? Remember the .json service file we downloaded? Good, move it to the same directory as `example_presto_v1_cr.yaml` and name it `gcs-key.json`. Then edit the deployment to look like that:

```bash
  hive:
    gcs:
      json-key-file-path: "./gcs-key.json"
    internalMetastore:
      image:
        pullPolicy: Always
      internalPostgreSql:
        enabled: true
      memory: 0.5Gi
      cpu: 0.5
```

After that:

```bash
kubectl apply -f example_presto_v1_cr.yaml
```

Beng, done. Now hive will be able to properly authenticate if you've set up the service access properly, which I think you did. But wait a second. If we want to read in some data, we need the data, but we don't have it.

There are two solutions here: find some example ORC file on the internet and just use that or prepare your own random set of test data. What are we doing to do? The latter of course! How? With Python. Let's first instal this one package we will need with:

```bash
pip install pyorc
```

Use virtualenv if you want to, I didn't.

Now, a simple script shall do:

```python
# filename: generate_orc.py
from random import choice

import pyorc


first_names = ("Jacob", "Mat", "Demon", "Lucifer", "Jaroslaw", "Kunaal", "Rajan", "Taro")
last_names = ("Sasin", "Smith", "Test", "Apple", "Leaf", "Shitsu", "Kowalski", "Górski")


with open("./users.orc", "wb") as data:
    with pyorc.Writer(data, "struct<col0:int,col1:string,col2:string>") as writer:
        for i in range(1000):
            writer.write((i+1, choice(first_names), choice(last_names)))

```

This will generate a list of a 1000 users with first and last names and ids. It's a very simple example, but will do. Now run it with:

```bash
python generate_orc.py
```

and bam. There we go.  You should see a new file in your dir called `users.orc` . Now go to your bucket, create a directory there called `import` and upload the file there. Now in order to import this file, we need to enter presto shell again. If you exited it before, here's a little reminder how to reach it:

```bash
presto --server <external ip of my lb>:8080 --user test
```

once you are there do:

```sql
USE hive.default;
CREATE TABLE people (id bigint, first_name var_char(60), last_name varchar(60)) WITH (external_location = 'gs://{your bucket name}/import/', format='ORC');
```

This will make Hive go to that bucket location and process ALL the files there, importing them and populating newly created table `people`. 

Done. Now try:

```sql
SELECT * FROM hive.default.people WHERE id < 10;
```

to print out first 10 rows. Does it work? If so, congrats.

Nice. We now can query stuff from ORC files stored in a Object Storage Service. What about getting data from a more popular data source, more `normal` one, like a `regular` db eg. postgres? Let's do that.

### Postgres

How can we query postgres from the inside of our presto cluster? First of all, we need to have such a db. For the purpose of this article, you can just provision a managed db on GCP. How to do that? Google it again. Just remember to authorize your cluster's IP address to access the db or use `0.0.0.0/0` to allow ANY IP to acces it. What's next?
Go back to the same file that you used to add hive gcs connector. Now open it and try to find section with `additionalCatalogs`. Configure it more or less like that:

```yaml
  additionalCatalogs:
    postgresql: |
      connector.name=postgresql
      connection-url=jdbc:postgresql://<your ip>:5432/<db name>
      connection-user=postgres
      connection-password=very-secure
```

Now - first issue here: PASSWORD STORED IN THE PLAIN TEXT OMG OMG. Usually, I'd use secrets to manage it there, as k8s has a mechanism for that, but this ain't no production setup guide. Plus if someone has access to the repo with your deployment code, it usually it's too late for security anyway, but I get your worry. This should NOT be done like that in real-life applications.

Okay. You added that, what now? Apply the changes with the same command you applied them in case of Hive, so the thing with `kubectl apply`.

Open your presto console and try to do something eg. list available schemas:

```sql
SHOW SCHEMAS FROM postgresql;
```

If that works for you, you are officially done. You can now query all you want. Your queries will be nicely summed up on the UI, you can see the details there.

## Summary

Well, we are more or less done. That was a fun exploration for me, as I did not have any experience with either Presto, Starburst or GCP. Had a blast overall, which is nice, especially in these daunting times. Anyway.

We've slightly tasted the things that Presto can do, but there's so much more to try. 

This is all for today's episode of grski's ramblings!
