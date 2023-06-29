Title:  Tenancy pattern in a SaaS product 
Date:   2022-11-30
Authors: Olaf Górski, Dominik Szady
Language: en
Slug: tenancy-en 
Description: Understanding/using multi-tenant architecture in Django and SaaS products 


![Thank you, Marta Buriak, for the illustration.](https://grski.pl/static/articles/tenants/tenants.png)

Understanding/using multi-tenant architecture in Django from the perspective of my protegee, our new teammate, a junior engineer at thirty3 - Dominik. Without further ado, I'll let him do the writing.

(Disclaimer: this post was written couple of years ago by me and Dominik Szady, who was my protegee at that time. I'm just publishing it now on my blog.)


## Junior Introduction

Hello there! My name is Dominik, I am a junior developer at thirty3, recruit among a bunch of professionals.

An environment that'll be challenging, but is probably the best one for a beginner like me to be in. Place where there's a mentor which can help me in tough times, answer all my questions and point the way, tell me about mistakes I make.

Does it make learning programming easier than it was before? Hell yes! Does it make it easy? Hell no!
Today I'd like to write a couple of words about my experience so far, new tasks, mentoring and so on, in a collaborative article together with my mentor - Olaf, and most important - about tenancy in software architecture.

I would say the process of learning could be divided into two parts:

understanding a new issue (technology, tool, etc.) which ends up in one having a general grasp of how things are done, that allows you to build things based on an example, do slight modifications to existing stuff and so on;

the never-ending process of mastery which leads to one being able to create complex stuff from the ground up;

For me, being a junior programmer means that I'll often face problems that will require me to do the first part - learn something new to solve them. This is exactly how I could describe my first month at thirty3 - being out of my programming comfort zone and doing things I have never done before. Which is GREAT.

## First days

First days at a new work are always tough and I swear when I set up my working environment at previous companies, something always went wrong - I was lacking some tools, packages, getting strange errors. Fortunately, running the project at thirty3 for the first time was quite the opposite.

The difference-maker, in this case, was the combination of Docker and Makefile. All I had to to was basically download docker (and docker-compose) for my PC and follow the damn README.md to have everything up and running. App is running. Documentation is there, practices are defined, code is clear and easy to understand, tests are there. It was a breeze.

At least until some point. It did not take a long time for me to get hit by multi-tenant architecture. What is that?
Imagine you have an application used by multiple companies (tenants).
You would like to make sure that you don't accidentally leak data between companies while making the architecture scalable and efficient.

## Tenants to the rescue

At thirty3 we use Django-tenants to solve this problem, at least in a lot of cases. There is one database instance to store data for our clients, but multiple schemas - one for every tenant (company). It creates logical separation between the data.
Before jumping to examples of how I tried understanding this concept, I will break it down for you so, hopefully, you will immediately notice my mistakes and get a grasp of how things work.
Let's assume we have a very simple Django project that allows companies to create projects on which they'll work.
We need two applications:

```
companies
projects
```



And models declared in respective models.py files:



```python
# `companies/models.py`
class Company(TenantMixin):
    name = models.CharField(max_length=255)
```





and



```python
# `projects/models.py`
class Project:
    name = models.CharField(max_length=255)
    is_paid = models.BooleanField()
```


The behavior we would like to have is that each Company has its Projects that are not accessible to other companies.

As I mentioned earlier every tenant has its schema in the database. It is created with the creation of a model that inherits from TenantMixin (Company).
The thing that allows us to distinguish tenants is a unique schema name (TenantMixin attribute) which we need to provide with the creation of every Company object. (Olaf's remark: it doesn't have to be schema name - it can be ID or almost anything really, as long as it's unique. Overall schema_name is just a metadata that lets us know where to search in the db)

Besides that, we need to create a specific schema called "public" whose purpose (O: Actually it's there in postgres by default, we just create the model in our table with tenants) is to store the global data not specific for a given tenant/Company and all the tenant schema names.

## Tenants in Django

The question we should ask now is: how Django knows which data should be stored in "public" schema and which in schemas for specific tenants?
It is done in settings file be setting up SHARED_APPS and TENANT_APPS variables. These are lists of Django applications (just like INSTALLED_APPS). Putting application in eg. TENANT_APPS will mean that tables for Models from this application will be created in each of tenant schemas. On the other side if we add our application in SHARED_APPS list, as we except tables will be created in "public" schema.

``` 
SHARED_APPS = ["companies", …]
TENANT_APPS = ["projects", …]
```

Another question is how does Django know on which tenant schema actions should be performed?
Tenants are identified by URL, eg. requesting an URL "tenant.something.com" would result in hostname being searched in an appropriate table in "public" schema. If the match is found, the schema context is updated which means that queries will be performed at matched tenant schema.
Django-tenants provides some utils to set the schemas from the code perspective.

```python
with schema_context(schema_name):
    # queries will be performed against the schema "schema_name"
```

or

```python
with tenant_context(tenant_object):
    #queries will pe performed against the schema of tenant_object.
```





Knowing all of this let's take a look at the code snippets below to identify some mistakes I made during the thought process.

```python
class TenantsTestCase(BaseTenantTestCase):
    def test_tenants_example(self):
        companies = Company.objects.all()
        ...
```

​        ...
The expected behavior for me would be get all the companies, the result was empty QuerySet. Ok, maybe I need to create one, lets try.

```python
class TenantsTestCase(BaseTenantTestCase):
    def setUp(self):
        Company.objects.create(name=”Test company”, schema_name=”test_schema”)
    def test_tenants_example(self):
        companies = Company.objects.all()
```

This time i received an error

`Can't create tenant outside the public schema. Current schema is test`

I asked myself "What is going on?", but managed to find somewhere the usage of `schema_context`. So i gave it a try:

```python
class TenantsTestCase(BaseTenantTestCase):
    def setUp(self):
        Company.objects.create(name=”Test company”, schema_name=”test_schema”)
    def test_tenants_example(self):
        companies = Company.objects.all()
```

Great, no error this time. Anyway, the companies variable is still empty QuerySet. One last try:

```python
class TenantsTestCase(BaseTenantTestCase):
    def setUp(self):
        with schema_context(“public”):
            Company.objects.create(name=”Test company”, schema_name=”test_schema”)
            Company.objects.create(name=”Test company”, schema_name=”test_schema”)
    def test_tenants_example(self):
        with schema_context(“public”):
            companies = Company.objects.all()
```

Finally, this time I got a QuerySet of two Company objects. But wait, I created one. Time to bring it all together. 

It turns out that when you run tests with Django-tenants, new tenant, with schema_name "test" is created and all the queries are performed against this schema unless we switch it. (O: At least in our case because we use FastTenant case -> otherwise you'll be creating new tenants too often and they take too long to run)

```python
class TenantsTestCase(BaseTenantTestCase):
    def setUp(self):
        # schema_context = "test"
        with schema_context("public"):
            # schema_context = "public"
            Company.objects.create(name=”Test company”, schema_name=”test_schema”)
    def test_tenants_example(self):
        # schema_context = "test"
        with schema_context("public"):
            # schema_context = "public"
            companies = Company.objects.all()
        # schema_context = "test"
```



Now, let's remember that Company which is our tenant object is stored in "public" schema so the empty QuerySets we received earlier were correct because we tried searching for Company object in schemas that do not contain them.
Going further, the creation of Project object needs to be done in the context of the specific tenant schema as this is the place where its tables are stored.

```python
class TenantsTestCase(BaseTenantTestCase):
    def test_tenants_example(self):
       # Here we can create project, as we are in context of “test” 
       # tenant
       Project.objects.create(name=”Test project”, is_paid=True)
       with schema_context("public"):
            # Here we can not create Project, we are in “public” 
            #context,no tables for Project here
            companies = Company.objects.all()
```

For me working with tenants resolves around tracking how the context changes to always know what queries can I perform and what effects to expect.

## Mentor's take

Okay. Enough from Dominik's perspective. Now it's my time to blabber.
Let's give you some context on a broader level.
What you've read so far is Dominik's understanding of the Tenancy concept and how we use it at thirty3. He's more or less correct, some things are oversimplified but the general idea is there. A little proud of him, took me way longer to grasp certain things.
I'll try to give you more information regarding the decision process we had when we started using tenants, why we use them and why you might want to do that too.

Let's start.

## What are tenants?

First thing - tenants. What are they? It's this concept, mostly used in eg. SaaS products, that, if you simplify things, they're your clients. I at least like to think in that way. When you create a bespoke solution for a given Company, only that given Company is the user there, most of the time that is.

Some things are defined globally in that DB, other things are defined and should be accessible only for that Company and so on. In a normal case where only that company will be using the app, you don't have to think much about that. A problem arises when you want to globalize that app and have multiple companies. All of them have some private data, some public data. This data should be separated and not accessible by other Companies using that given SaaS. You need another layer of abstraction that logically binds or encapsulates this Company data. Aw shiet, here go tenants. What are other benefits?

## Scaling a SaaS

As times go and our apps grow, when you start receiving clients that are not your immediate family nor your investors, things start to get more complicated. Privacy is suddenly important. Data breaches/leaks are costly. Then the product starts getting traction, your user base grows, optimization becomes a problem. It happens in almost every successful product.

Good thing is to think about these problems and prepare for them but only as much as you need to, so you don't over engineer. In our case, most of the time, we decided to use Tenant pattern for that, using DB schemas to realize it. It makes it harder for us to leak our client's data and easier to scale our app up while not putting much overhead over our development time.

## Methods of scaling the database

Because what's the limiting factor most of the time, in a lot of apps? DBs. What are the ways to scale DBs? Horizontal and Vertical.
Vertical means that you have one DB on which you just throw more resources - better hardware. This scaling has its limits. Once you hit them, no matter how much money you have - that's it. Can you do something about it?

Here comes Horizontal scaling, which means using more machines/DBs instead of just one. It's quite tricky too - it's not just about creating more instances of the db. Things like master-slave patterns, data consistency, network of nodes and so on come into play here. Quite a complex topic if you ask me.
Anyways.

Of course, this way has limits too, but they're often way bigger than the limits of the vertically scaled system

.
Now - managing tenants in a SaaS-like product can be done in many different ways. First is DB per client. Here we'd probably have one bigger DB with things shared globally in the app and then smaller (or bigger) DBs with data unique to the client.

Second is Schema per client, which means one DB, that's almost splitted into subdbs - I'm oversimplifying but bear with me.
The third is custom permissions and relations in tables for example with the data of all clients being put together in one schema, one db.

1st one is costly and troublesome to manage at a smaller scale.

3rd one often ends up in messy DB tables, privacy concerns.

2nd one, however… Well, it almost puts no overhead to a situation in which you'd have plain single schema/DB architecture - not a SaaS one, but it makes it easy to scale and separate client's data by abstracting DBs - instead of having multiple DBs that are a hassle to manage, it uses one DB as if it was 'many', in a way at least.

Hence, we went for it. And we are quite satisfied with the results, honestly.

Also a big selling point for tenants is the fact that operating on the querysets is just way easier. Querying for Invoices only from a given company? Just set the proper context and that's all.

## Different methods of managing tenants

The so-called search path that we set for postgres's queries using our db router, can be set in multiple ways. Traditional tenant pattern uses subdomains as means of identifying the tenant - eg x.myproduct.com will search for tenant x. That's one way. Catches here that we had to consider when using default identyfing model: make sure to forbid users from registering tenants with names of frequently used subdomains eg. ftp, mail, static and so on, otherwise you might be in for a nasty surprise. Also, remember to have certificates that have a wildcard for the subdomains - otherwise you'll be left without SSL for your tenants subdomains, which sucks quite a bit.

Another is to for example put it as a part of the url, but not the subdomain. For example: example.com/v1/tenant/someendpoint .
We usually use the lattter one.

## What tenants did for us

We achieved:

1. no additional costs of managing infrastructure
2. in the beginning, we still can start with just one DB
3. it's easy to scale up -> change the way you set the search path for the schema and you are done -> horizontal scaling is a breeze
4. customer's data is separated in a better way
5. we don't have to bother with tricky querysets

So that'd be the small glimpse into tenants architecture we choose. Of course I just lightly touched the topic. Anyways.

This article is more of an exercise for Dominik to learn to express himself and start writing, communicating, rather than something that's supposed to be extremely filled with knowledge.

Not so long ago I wrote a post about my first months at thirty3, while still considering myself a Junior then. Now I'm someone who has a Junior person as their protegee. Feels nice. Growth. I like that.

So, enough about this exercise. Thank you all for reading, and let's see you soon.

PS: cons of having me as a mentor - you'll probably start writing.

