Title: Performance of different string concatenation methods in Python - why f-strings are awesome
Authors: Olaf Górski
Date: 2020-01-10
Slug: fstrings-performance
Language: en
Description: Few words on performance of f-string and string concatenations methods in Python. 


Hi there, today I'd like to write a few things about f-strings in #python, why I think they're awesome, why we should use them and why they'll save the world from World War III.

Personally speaking, I'm a big proponent of f-strings. I sue them when I can where I can and tell people to do the same. Elegant, readable and simple in usage. I got curious though - I mean, nothing in life comes free, right? This elegance, simplicity and just pure beauty must come at a price. In Python, most of the time, the price we pay for different things is performance. Well, I've decided to check if that's the case with f-strings.

So today we will compare few ways you can modify/add strings together or generally format them.

I'll compare f-strings, string concatenation, join() method, format() method and template string.

No % operator for string in this comparison. Why? It's old. It's a bit ugly. My personal preference - I just don't like it. It reminds me of C way too much and Python syntax ain't no C. We can do better than %.

## How we will test
To test and measure the performance of our code we will use timeit module that's a part of Python standard lib, calling Python from a command line. All the variables that we will use, will be defined in a command outside of the measuring time as to reduce the amount of overhead we have and the noise that Python itself generates - we are just interested in the string manipulation functions, nothing more.
We will run standard 1000000 iterations in each loop, with 3 loops for each command. From all of these the program will output the shorter time it took to finish a given operation. Now let's get to the job.

## Comparison
So, watch and behold my fugly code that I've produced on my knee, the one below (as if other code I produce was any different though…), that'll measure everything.
```
python3 -m timeit -s "x = 'f'; y = 'z'" "f'{x} {y}'"  # f-string
python3 -m timeit -s "x = 'f'; y = 'z'" "x + ' ' + y"  # concatenation
python3 -m timeit -s "x = 'f'; y = 'z'" "' '.join((x,y))"  # join
python3 -m timeit -s "x = 'f'; y = 'z'; t = ' '.join" "t((x,y))"  # join2
python3 -m timeit -s "x = 'f'; y = 'z'" "'{} {}'.format(x,y)"  # format
python3 -m timeit -s "x = 'f'; y = 'z'; t = '{} {}'.format" "t(x,y)"  # format2
python3 -m timeit -s "from string import Template; x = 'f'; y = 'z'" "Template('$x $y').substitute(x=x, y=y)"  # template string
python3 -m timeit -s "from string import Template; x = 'f'; y = 'z'; t = Template('$x $y')" "t.substitute(x=x, y=y)"  # template string2
python3 -m timeit -s "from string import Template; x = 'f'; y = 'z'; t = Template('$x $y').substitute" "t(x=x, y=y)"  # template string3
```
Looks basic and crude, but it'll do the job. For Template string I've considered three cases. First one is when the initialization of the instance of the Template class happens during the time that counts towards the result, the second one is where the initialization is done before the timer is started, I initialize the instance and pass it over and the third one is where I initialize the instance and also access the proper method already, so that the only thing that will contribute to the outcome's time, will be the method. What do I mean by that?
Well, basically, as you know, instantiating a class takes time and memory in Python, well in other language too, actually. So considering a case where this takes place in a different part of the code is a sane thing to do. That much is obvious.

But why do I also test a case, in which I pass instance.attribute to the test loop, instead of calling instance.attribute in the loop itself? Well, it's quite interesting nifty thing.
Python, in the background, when you create a class, creates a dictionary that contains a mapping with all the attributes/method names and so on that you have on a class and that you can access using the . dot operator. So each time you you use it, in the background, a dictionary lookup happens. Of course this changes a bit if you use `__slots__`, but we won't be discussing this case here.
If the key is found -> proper attr/method is returned, otherwise we get attribute error. Anyway. All of this costs time. Even though lookup, for the most part and in most cases, in dictionaries is O(1) operation, then well, it still means additional steps. So just for the sake of it, we will see what's the difference with and without that operation by testing different cases.

Same thing for join & format. Here I've considered two cases for each - one with `.` access and one without - just calling a function.

## Here are the results.
```
f-string: 10000000 loops, best of 3: 0.0791 usec per loop
concat: 10000000 loops, best of 3: 0.0985 usec per loop
join , no lookup: 10000000 loops, best of 3: 0.112 usec per loop
join: 10000000 loops, best of 3: 0.144 usec per loop
format, no lookup: 1000000 loops, best of 3: 0.232 usec per loop
format: 1000000 loops, best of 3: 0.264 usec per loop
template string3: 1000000 loops, best of 3: 1.01 usec per loop
template string2 loops, best of 3: 1.06 usec per loop
template string: 1000000 loops, best of 3: 1.36 usec per loop
```

## Surprise, surprise!
Honestly, I did not expect that f-string will be both the most elegant solution and also the fastest one! This smears joy over my heart, makes me want to live.
The second place went to concatenation and so on - you can basically see for yourself.

Considering that the optimization I made - getting rid of the dot operation and attr lookup in the test loop, is rather unpractical and should not be used unless you want to end up in seventh circle of hell, together with Java creators, I'll remove it from the rankings - just wanted to show it for the sake of it. So here's the ranking for a simple case of manipulating three strings.

1. f-string
1. concatenation
1. join()
1. format()
1. Template-string

## Let the joker dance

I've showed you a simple example with three strings and their manipulation. What about a case when someone wants to manipulate more of them?! Like, idk, maybe 13 at a time? For example you want to create a string containing 13 letters separated by a space. WHY NOT? Let's do it, Morty.

Also take note, here I won't test the variants with dot operator and lookup and without them. Why? Because as the amount of variables increases, the lookup itself becomes smaller and smaller part of the result, in this case it practically does not matter, so why bother.
```
python3 -m timeit -s "a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "f'{a} {b} {c} {d} {e} {f} {g} {h} {i} {j} {k} {l} {m}'"  # f-string
python3 -m timeit -s "a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ' ' + g + ' ' + h + ' ' + i + ' ' + j + ' ' + k + ' ' + l + ' ' + m"  # concat
python3 -m timeit -s "t = [str(i) for i in range(13)]" "' '.join(t)"  # join
python3 -m timeit -s "t = [str(s) for s in range(13)]" "'{} {} {} {} {} {} {} {} {} {} {} {} {}'.format(*t)"  # format
python3 -m timeit -s "from string import Template; a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "Template('$a $b $c $d $e $f $g $h $i $j $k $l $m').substitute(a=a, b=b, c=c, d=d, e=e, f=f, g=g, h=h, i=i, j=j, k=k, l=l, m=m)"  # template string
```

Now I wonder how the results will turn out.

```
join: 1000000 loops, best of 3: 0.217 usec per loop
f string: 1000000 loops, best of 3: 0.399 usec per loop
format: 1000000 loops, best of 3: 0.811 usec per loop
concat: 1000000 loops, best of 3: 1.13 usec per loop
template string: 100000 loops, best of 3: 2.04 usec per loop
```

Some changes there. A lot of them actually, but basing on previous results, I'm not that surprised. Why?

Well, let's begin with what changed. Join on the 1st place, from the 3rd, concat on second to last from it's glorious 2nd place, format to 3rd from the 4th. Template-string last, as always. Quite reasonable outcome.

First place, so our winner in this case, join is obvious case of optimization. Just look at what we are doing here - nothing more than just joining some strings with a common separator and that's it. Wasn't join precisely designed to do just that? I'm sure, and CPython source code shows this, that there was some heavy optimizing made on this method as it's part of the core of the language, be it on the implementation level or maybe even on the CPython level. It allows join to handle an arbitrary (to a point) large number of args while still being quite performant. Which is nice. Why? Because again - the most elegant solution (f-string was not as elegant in this particular case) turned out the fastest.

Second place, f-strings. Not surprised anymore. After the initial result of f-strings being first and me being surprised, I dug a bit deeper. Turns out that at first, in the first implementation, f-strings very indeed very slow. It was because they were, internally, translated to nothing more than a bunch of joins/formats, don't remember exactly. Only later did they create a special OPCODE on the CPython level, specifically designed for f-strings, which made it way faster as it allowed the core developers to make optimizations on C-level code.

Why did format appear before concatenation? Let me tell you. It's all about evaluation and strings being immutable in Python. Each time we do anything to them, new one is created and returned. In order to do that, Python must allocate new memory for the new string with appropriate length, copy the contents of the strings. Allocation and copy, this sounds like something that might take some time. In case of our code, this takes place each time we call the + operator. So basically it means, that when we typed in `a + ' ' + b + ' ' + …` and so on, underneath Python called in something like that:

1. Allocate memory that'll fit a and ' '
1. Copy a to that place
1. Copy ' ' to that place
1. Resulting string you ought to add to b
1. Allocate memory that'll fit the resulting string and b
1. Copy ….

You get the idea. All of this takes time.
Last one is obviously our Trajan horse - template string.

## Summary
In Python, most of the time, mechanisms that look elegant in a particular situation, are almost for sure optimized for it, that's why you ought to use them. I love this snake. Elegant code that also is the fastest option available most of the time. Nice.
If there are a lot of strings you ought to join in a predictable manner - use join.
In most of the other cases, use f-strings where you can, enjoy your life.

Just like we, at thirty3, do. We enjoy life, use f-strings, fast and chill. That's it for today.