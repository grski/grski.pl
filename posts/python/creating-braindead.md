Title: How I created my own blogging system in less than 100 lines of code
Date: 2020-04-12 
Slug: braindead
Author: Olaf Górski
Language: en
Description: How you can do so much with so little of Python code to create wonderful things.



Recently I started thinking about changing my blogging engine and the template that it used. It felt a bit too bloated for my tastes, outdated and messy. After a couple of months of waiting, I've finally spun into action to create [braindead](https://github.com/grski/braindead) - a braindead simple static site generator with markdown and code highlighting support.



![Load time of grski.pl generated with braindead](https://grski.pl/static/articles/creating-braindead/standards2.jpg)



The first thing that I did was to look through available solutions for blogs, blogging engines and free templates. I had experience with Pelican and Jekyll. Both were quite okay, yet felt like they're too much, some processes there were too complicated for me. Same with Hugo, GatsbyJs and the rest.



I won't even mention the templates that I've seen - most of them were just too heavy. Some candidates satisfied my visual senses. They had a problem though, most of the time they used React or Vue. While both of these are marvellous pieces of Software and there are plenty of places where you should use them, this was not such a place. Why?



## Bloatware

I'm a minimalist that tries to live their life with as little as possible. I don't even own a bed as sleeping on the floor is comfortable enough. Minimalism allows me to focus on what truly matters. So when I'm facing current trends in Software Development, I'm lost. One, in particular, got under my skin - its name is BloatWare. I straight out hate it. For multiple reasons [check out this post - Software Disenchantment by tonsky](https://tonsky.me/blog/disenchantment/), be it the fact that most of it is slow, or the fact that through wasteful resource management, BloatWare uses way more electricity and hardware than it should. It's a small thing, but something that nonetheless adds up to environmental damage overall. Even such things do compound over time, giving a lot of impact in the end.



I hate it when someone takes a simple static landing page and creates React App out of it with hundreds of js libs used and images that weight dozens of MBs. All of that while it has the same functionality as the old one. But you know, it's in react now, that's so cool, rightttt? me_crying_internally.jpg 



A lot of current websites could be easily made in pure HTML/CSS and maybe some JS. They'd be faster to develop and make for a better UX. Each tool has it's best uses. The problem lies in the fact that once we have a hammer, everything is a nail.



Because of all that and how available solutions did not satisfy my needs completely, I've decided to create my blogging engine/static site generator. Just for the heck of it, just because I can. 

![funny meme](https://grski.pl/static/articles/creating-braindead/standards.png)



## Let's do this

My assumptions when creating this were as follows:

1. I decided to go with a stack I know - Python, Jinja, Markdown. It's crazy how much you can do just with these. 
2. Code shall be type hinted.
3. I'll use git and GitHub to host my repo.
4. The code will be opensource and on MIT license.
5. I'll use black, isort, pyflakes and autopyflake for code formatting, bandit for some security scanning.
6. poetry as dependency/packaging manager. No pipenv - it's dead.
7. Automated builds and releases through GitHub actions.
8. Versioning with bumpversion.
9. Two branches: develop - bump patch, master - bump minor. Major - manual releases.
10. Additional configuration of context/blog through TOML.



The plan was: I'll write my posts in markdown files, render them to HTML and enrich with jinja. I'll keep all my posts in a directory called `posts` and index will be named index.md. While I'm at that I might as well add support for pages other than index.



So the first piece of code I decided to create was about that - finding all the markdowns and rendering them.



```python
def find_all_posts(directory: str = "posts") -> Iterable[str]:
    """ All the md posts - both extensions .markdown and .md"""
    return find_all_markdown_and_md_files(directory=directory)


def find_all_pages(directory: str = "pages") -> Iterable[str]:
    """ Similar to the one above, but searches for posts - another directory. Both .md and .markdown """
    return find_all_markdown_and_md_files(directory=directory)


def find_all_markdown_and_md_files(directory: str) -> Iterable[str]:
    """ Base method that finds both .md and .markdown recursively in a given directory and it's children. """
    md_files: Generator = iglob(os.path.join(directory, "**", "*.md"), recursive=True)
    markdown_files: Generator = iglob(os.path.join(directory, "**", "*.markdown"))
    return chain(md_files, markdown_files)
```



To find all the `.md` and `.markdown` files recursively, I've used `glob` packages and it's `iglob` function. `iglob` is a version of `glob` that instead of returning an in-memory list of found filenames, returns a generator.



Back in the days, I used to work with big volumes of data. Until this day I'm a little bit skewed in this regard. It's probably not possible, but someone might decide to create way too many files. Reading them all at once to memory might use too much of it. Hence the iglob instead of `glob`.



We have the filenames, now time for rendering the markdown.

```python
md: Markdown = Markdown(extensions=["tables", "fenced_code", "codehilite", "meta", "footnotes"])

def render_markdown_to_html(md: Markdown, filename: str) -> str:
    """ Markdown to html. Important here is to keep the reset() method. """
    return md.reset().convert(open(filename).read())
```



To do that I've used python-markdown package with a couple of extensions for more usability. Off to Jinja rendering we go.



I came up with something like this:

```python
def render_jinja_template(template: Template, context: dict) -> str:
    """ Rendering jinja template with a context and global config. """
    context_with_globals = {**context, **CONFIG}
    return template.render(context_with_globals)
```



Now time to take care of context building for jinja templates:

```python
def build_meta_context(md: Markdown) -> Dict[str, str]:
    """
    This builds context that we get from Meta items from markdown like
    post/page Title, Description and so on.
    """
    return {key: "\n".join(value) for key, value in md.Meta.items()}


def build_article_context(article_html: str, md: Markdown) -> Dict[str, str]:
    """ Contant that'll be used to render template with jinja. """
    return {"content": article_html, **build_meta_context(md=md)}


def add_url_to_context(jinja_context: dict, new_filename: str) -> dict:
    """ Builds and adds url for a given page/post to jinja context. """
    jinja_context["url"] = f"{BASE_URL}{new_filename.replace(f'{DIST_DIR}/', '')}"
    return jinja_context

```



With that done it was time for saving the output. I decided to preserve the structures of the posts as default behaviour. Same with the names.

```python
def save_output(original_file_name: str, output: str) -> str:
    """ Saves a given output based on the original filename in the dist folder"""
    new_location: str = os.path.splitext(os.path.join(DIST_DIR, original_file_name))[0] + ".html"
    new_directory, _ = os.path.split(new_location)
    if not os.path.exists(new_directory):
        os.makedirs(new_directory)
    output_file: TextIO = open(new_location, "w")
    output_file.write(output)
    return new_location
```

Last thing: it'd be nice to have the statics gathered.

```python
def gather_statics() -> None:
    template_statics = os.path.join(TEMPLATE_DIR, "static")
    if os.path.exists(template_statics):
        shutil.copytree(template_statics, os.path.join(DIST_DIR, "static"), dirs_exist_ok=True)
```

Now, putting it all together

```python
def render_blog() -> None:
    """ Renders both pages and posts for the blog and moves them to dist folder."""
    posts: Iterable[dict] = reversed(sorted(render_posts(), key=lambda x: x["date"]))
    render_all_pages()
    render_index(posts=posts)
    gather_statics()


def render_all_pages() -> None:
    """ Rendering of all the pages for the blog. markdown -> html with jinja -> html"""
    template: Template = jinja_environment.get_template("index.html")
    for filename in find_all_pages():
        render_page(filename=filename, md=md, template=template)


def render_page(filename: str, md: Markdown, template: Template, additional_context: dict = None):
    additional_context = additional_context if additional_context else {}
    page_html: str = render_markdown_to_html(md=md, filename=filename)
    jinja_context: dict = {"page": {"content": page_html}, **additional_context}
    output: str = render_jinja_template(template=template, context=jinja_context)
    save_output(original_file_name=jinja_context.get("slug", filename), output=output)


def render_posts() -> Iterable[dict]:
    template: Template = jinja_environment.get_template("detail.html",)
    return [render_and_save_post(md=md, filename=filename, template=template) for filename in find_all_posts()]


def render_and_save_post(md, filename, template) -> dict:
    """ Renders blog posts and saves the output as html. md -> html with jinja -> html"""
    article_html: str = render_markdown_to_html(md=md, filename=filename)
    jinja_context: dict = build_article_context(article_html=article_html, md=md)
    output: str = render_jinja_template(template=template, context=jinja_context)
    new_filename: str = save_output(original_file_name=jinja_context.get("slug", filename), output=output)
    return add_url_to_context(jinja_context=jinja_context, new_filename=new_filename)


def render_markdown_to_html(md: Markdown, filename: str) -> str:
    """ Markdown to html. Important here is to keep the reset() method. """
    return md.reset().convert(open(filename).read())


def render_index(posts: Iterable[dict]) -> None:
    md: Markdown = Markdown(extensions=["tables", "fenced_code", "codehilite", "meta", "footnotes"])
    template: Template = jinja_environment.get_template("index.html")
    filename = "index.md"
    additonal_context: dict = {"articles": posts}
    render_page(filename=filename, md=md, template=template, additional_context=additonal_context)
```



This is the core of the app, as for the small details, I won't bother you with them.



The original version that I wrote had less than 100 lines of code. Since then I've added a bit of documentation, some features and so on.  Right now with all the new features and comments, I'm up to... Hm, I don't know. Let's check.



```bash
(braindead-th-wknNA-py3.8) [grski@grski braindead]$ find . -name "*.py" -exec cat {} + | wc -l
168

```

168 LoC, not bad. 

## Default template

I decided to base on [kiss](https://github.com/ribice/kiss) template for Hugo, slightly modifying and simplyfing it. I've slimmed down the css, minified it, changed the html a bit, but overall the look and feel stayed the same. I'll need to slim down the css even more in the future.

I like it though - it's very minimalistic yet elegant. However if you do not like it - you can create your own.

## Usage

How to use braindead? Just create index.md, run `pip install braindead` and then `braindead`. That's it. This is the minimal requirement. Want more? Create `posts` and `pages` dir, put your content there.

## CI/CD

I've added github actions to the repo that lint the code with all the linters, run tests (none written so far though) and create automatic PRs if everything is okay.

If a PR got merged, it results in a new release on GH and [PyPi](https://pypi.org/project/braindead/) of the project.

## The result

Let's start with generation speed - it's quite imporant.

My blog has about 50 pages now. To render it, [braindead](https://github.com/grski/braindead) took: 

```
real    0m0,975s
user    0m0,908s
sys     0m0,060s
```

Below 1 second. I find that acceptable.

Now on to the rendering of the page:

![Load time of grski.pl generated with braindead](https://grski.pl/static/articles/creating-braindead/load.png)

Google PageSpeed Insight:
![Speed score on pagespeed insights](https://grski.pl/static/articles/creating-braindead/speedinsight.png)



This is how it looks like:
![Default template of braindead](https://grski.pl/static/articles/creating-braindead/template.png)


You can see a live example on my blog - [grski.pl](https://grski.pl)

## Summary

I'm quite satisfied with what I've created. It's simple, crude and that's the goal. If you want to learn more, I encourage you to visit the repo's site: [braindead](https://github.com/grski/braindead). Overall it was a good exercise to create something for fun, something that just works.

Lastly, I'd like to ask something of you. Please use right tools for the right job. I might be crazy, but I think that going further along on the path of simple sites that take 20 seconds to load and eat up half of your RAM while driving the CPU crazy, is not a good idea. Let's write simple software that runs they way it should. 