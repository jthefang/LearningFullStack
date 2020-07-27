- Going to make a polling app following this [video tutorial](https://www.youtube.com/watch?v=e1IyzVyrLSU)
  - See [`pollster_project`](./pollster_project)
- Django is a high-level Python web framework for rapid design

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Setting up virtual environment for python](#setting-up-virtual-environment-for-python)
- [Databases](#databases)
- [Setup](#setup)
- [Models](#models)
- [Creating migration for data](#creating-migration-for-data)
- [Adding mock data](#adding-mock-data)
- [Setup admin user](#setup-admin-user)
- [Front-end views](#front-end-views)
  - [Pass data to be rendered in the view](#pass-data-to-be-rendered-in-the-view)
  - [Adding links to other views](#adding-links-to-other-views)
  - [Including partials (e.g. a navbar)](#including-partials-eg-a-navbar)
- [Creating a landing page](#creating-a-landing-page)

## Setting up virtual environment for python

- `pip install pipenv`
- `pipenv shell`
  - creates virtual environment
  - any packages we install will go into this virtual env instead of globally
  - `Pipfile` will contain info about the packages required for the virtual env
- `pipenv install [package-name]`
  - e.g. `pipenv install django`

## Databases

- SQLite database is default for Django
- Can use Postgres and MySQL by changing settings in the settings file

## Setup

- `django-admin startproject [project-name, e.g. pollster]`
  - your project contains your whole website
  - the project can have within it many apps
  - `manage.py` in the project folder is what we use to start the server and manage migrations (don't need to touch this)
  - `settings.py` is where we put our secret key for production, base directory, installed apps, middleware, database definitions (e.g. SQLite3)
  - `urls.py` is where we create our routes for our apps (each app will have its own URL)
  - `wsgi.py` is a file for running the server (don't need to touch this)
- `python manage.py runserver 8081` to run the server on port 8081
  - default port is 8000
  - Unapplied migrations message
    - there are migrations ready to create tables (e.g. the default admin, auth, contenttypes, sessions tables that are needed as boilerplate for a Django app)
    - `python manage.py migrate` to apply these migrations and create those tables
- `python manage.py startapp polls`
  - to create an app in the project 
  - `migrations` folder for migrations
  - `models.py` where you create database models (e.g. tables)
  - `views.py` can render templates to certain URLs
- VSCode:
  - Shift + Cmd + P: `Python: Select Interpreter` > select the correct virtualenv for this project

## Models

```Python
from django.db import models

# Create your models here.
class Question(models.Model):
  # id created automatically: primary key, auto-increment
  question_text = models.CharField(max_length=200)
  pub_date = models.DateTimeField('date published')

  def __str__(self):
    return self.question_text

class Choice(models.Model):
  # have reference to corresponding Question row, if Question is deleted then that delete will cascade to all the Choice rows that reference that question 
  question = models.ForeignKey(Question, on_delete=models.CASCADE)
  choice_text = models.CharField(max_length=200)
  votes = models.IntegerField(default=0)

  def __str__(self):
    return self.choice_text
```

## Creating migration for data

- Add the app to the project `settings.py`
```Python
INSTALLED_APPS = [
    'polls.apps.PollsConfig', #refers to the app polls/apps.py PollsConfig class
    ...
]
```
- `python manage.py makemigrations polls` to make the migration file (e.g. `0001_initial.py` which tells the database how to create the table)
- `python manage.py migrate` to actually make the migration (create the table)

## Adding mock data

- `python manage.py shell`
- Then in the shell:
  - `from polls.models import Question, Choice`
  - `Question.objects.all()` 
    - will return all rows in the Question table
  - `from django.utils import timezone`
  - `q = Question(question_text='What is your favorite Python Framework?', pub_date=timezone.now())`
  - `q.save()` to create the new Question
  - `q.id` or `q.question_text` to check the field values
- `Question.objects.filter(id=1)`
  - to filter the table by id (returns array)
- `q = Question.objects.get(pk=1)`
  - get single Question object with primary key (i.e. id) = 1
- `q.choice_set.all()` to get the Choice objects that reference this question
  - `q.choice_set.create(choice_text="Django", votes=0)` to create a Choice referencing this Question

## Setup admin user

- `python manage.py createsuperuser`
  - create username and password (e.g. admin, 1234)
- `python manage.py runserver 8081` to run the server
- Go to the `/admin` url (e.g. `http://127.0.0.1:8081/admin/`)
  - login with the super user account you created
- You can actually manage your database from this admin page
  - Add admin functionality for your models in `polls/admin.py`
```Python
from django.contrib import admin

# Register your models here.
from .models import Question, Choice

admin.site.register(Question)
admin.site.register(Choice)
```
  - Now you can see the Questions and Choices table on the admin page under the Polls app
```Python
from django.contrib import admin

# Register your models here.
from .models import Question, Choice

admin.site.site_header = "Pollster Admin" # rename the admin page
admin.site.site_title = "Pollster Admin Area"
admin.site.index_title = "Welcome to the Pollster admin area"

class ChoiceInline(admin.TabularInline):
  model = Choice 
  extra = 3 # how many extra fields do we want

class QuestionAdmin(admin.ModelAdmin):
  fieldsets = [
    (None, {
      "fields": ['question_text']
    }),
    ('Date Information', {
      "fields": ['pub_date'], 
      "classes": ['collapse']
    }),
  ]
  inlines = [ChoiceInline]
  
# admin.site.register(Question)
# admin.site.register(Choice)
admin.site.register(Question, QuestionAdmin)
```
  - Will display the only the Questions on the main admin page, but will display the Choices referencing that Question as inline fields for that Question

## Front-end views

- Create a HTML template in `templates/app-name/index.html`
  - This templates directory should be inside the root `pollster` directory, e.g.
  - `pollster/`
    - `polls/`
    - `pollster/`
      - `settings.py`
    - `templates/`
      - `polls/`
        - `index.html`
      - `base.html`
        - will include bootstrap CDN
```HTML
<!-- base.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <title>Pollster {% block title %}{% endblock %}</title>
</head>

<body>
  <div class="container">
    <div class="row">
      <div class="col-md-6 m-auto">
        {% block content %}{% endblock %}
      </div>
    </div>
  </div>
</body>
</html>
```
```HTML
<!-- polls/index.html -->
{% extends 'base.html' %}

{% block content %}
POLLS
{% endblock %}
```
- In the project `settings.py`, setup the templates directory
```Python
TEMPLATES = [
    {
        ...
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        ...
    },
]
```
- Render the template in your app's `views.py` (e.g. `polls/views.py`)
```Python
from django.shortcuts import render

# Create your views here.
from .models import Question, Choice 

# Get questions and display them
def index(request):
  return render(request, 'polls/index.html') #render the template
```
- Create a `urls.py` for your app (e.g. `polls/urls.py`) and hand it the index function
```Python
from django.urls import path

from . import views 

app_name = 'polls' #set the name space for the view 
urlpatterns = [
  path('', views.index, name='index')
]
```
- Include that urls in the project `pollster/urls.py`
```Python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('polls/', include('polls.urls')),
    path('admin/', admin.site.urls),
]
```
- Going to `/polls` should display your app's view (index.html)

### Pass data to be rendered in the view

- In app `views.py`
```Python
from django.shortcuts import render

# Create your views here.
from .models import Question, Choice 

# Get questions and display them
def index(request):
  latest_question_list = Question.objects.order_by('-pub_date')[:5] #order by descending date (latest 5 questions)
  context = {'latest_question_list': latest_question_list} #pass in data to template as object
  return render(request, 'polls/index.html', context) #render the template
```
- Then in the template `index.html`
```HTML
{% extends 'base.html' %}

{% block content %}
  <h1 class="text-center mb-3">Poll Questions</h1>
  {% if latest_question_list %}
    {% for question in latest_question_list %}
      <div class="card mb-3">
        <div class="card-body">
          <p class="lead">{{ question.question_text }}</p>
        </div>
      </div>
    {% endfor %}
  {% else %}
    <p>No polls available</p>
  {% endif %}
{% endblock %}
```

### Adding links to other views

- Add other templates to `template/polls`
```HTML
<!-- polls/detail.html -->
{% extends 'base.html' %}

{% block content %}
  <a class="btn btn-secondary btn-sm mb-3" href="{% url 'polls:index' %}">Back to polls </a>
  <h1 class="text-center mb-3">{{ question.question_text }}</h1>

  {% if error_message %}
  <p class="alert alert-danger">
    <strong>{{ error_message }}</strong>
  </p>
  {% endif %}

  <form action="{% url 'polls:vote' question.id %}" method="post">
    {% csrf_token %}
    {% for choice in question.choice_set.all %}
      <div class="form-check">
        <input type="radio" name="choice" class="form-check-input" id="choice{{ forloop.counter }}" value="{{ choice.id }}" />
        <label for="choice{{ forloop.counter }}">{{ choice.choice_text }}</label>
      </div>
    {% endfor %}
    <input type="submit" value="Vote" class="btn btn-success btn-lg btn-block mt-4" />
  </form>
{% endblock %}
```
```HTML
<!-- polls/results.html -->
{% extends 'base.html' %}

{% block content %}
  <h1 class="text-center mb-5">{{ question.question_text }}</h1>
  
  <ul class="list-group mb-5">
    {% for choice in question.choice_set.all %}
      <li class="list-group-item">
      {{ choice.choice_text }} <span class="badge badge-success float-right">{{ choice.votes }} vote{{ choice.votes | pluralize }}</span>
      </li>
    {% endfor %}
  </ul>

  <a href="{% url 'polls:index' %}" class="btn btn-secondary">Back to polls</a>
  <a href="{% url 'polls:detail' question.id %}" class="btn btn-dark">Vote again?</a>
{% endblock %}
```
- You can add a link to these views from the index.html
```HTML
<!-- polls/index.html -->
<a href="{% url 'polls:detail' question.id %}" class="btn btn-primary btn-sm">Vote now</a>
<a href="{% url 'polls:results' question.id %}" class="btn btn-secondary btn-sm">Results</a>
```
- Add these views in `views.py` and `urls.py`
```Python
#views.py
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.urls import reverse

# Create your views here.
from .models import Question, Choice 

# Get questions and display them
def index(request):
  latest_question_list = Question.objects.order_by('-pub_date')[:5] #order by descending date (latest 5 questions)
  context = {'latest_question_list': latest_question_list} #pass in data to template as object
  return render(request, 'polls/index.html', context) #render the template

# Show specific question and choices
def detail(request, question_id):
  try:
    question = Question.objects.get(pk=question_id)
  except Question.DoesNotExist:
    raise Http404("Question does not exist")
  return render(request, 'polls/detail.html', {'question': question})

# Get question and display results
def results(request, question_id):
  question = get_object_or_404(Question, pk=question_id)
  return render(request, 'polls/results.html', {'question': question})

# Vote for a question choice
def vote(request, question_id):
  #print(request.POST['choice']) will come from the form
  question = get_object_or_404(Question, pk=question_id)
  try: 
    selected_choice = question.choice_set.get(pk=request.POST['choice'])
  except (KeyError, Choice.DoesNotExist):
    # Redisplay the question voting form
    return render(request, 'polls/detail.html', {
      'question': question, 
      'error_message': "You didn't select a choice.",
    })
  else:
    selected_choice.votes += 1
    selected_choice.save() 
    # Always return an HttpResponseRedirect after successfully dealing with POST data.
    # This prevents data from beign posted twice if a user hits the Back button.
    return HttpResponseRedirect(reverse('polls:results', args=(question.id,)))
```
```Python
#urls.py
from django.urls import path

from . import views 

app_name = 'polls' #set the name space for the view 
urlpatterns = [
  path('', views.index, name='index'),
  path('<int:question_id>/', views.detail, name='detail'),
  path('<int:question_id>/results/', views.results, name='results'),
  path('<int:question_id>/vote/', views.vote, name='vote'),
]
```

### Including partials (e.g. a navbar)

- `templates/partials/_navbar.html`
```HTML
<nav class="navbar navbar-dark bg-primary mb-4">
  <div class="container">
    <a class="navbar-brand" href="/">Pollster</a>
  </div>
</nav>
```
- Including it (in `templates/base.html`)
```HTML
<!DOCTYPE html>
...

<body>
  <!-- Navbar -->
  {% include 'partials/_navbar.html' %}
  ...
</body>
```

## Creating a landing page 

- Make it a new app `python manage.py startapp pages`
- Add the template: `templates/pages/index.html`
```HTML
{% extends 'base.html' %}

{% block content %}
  <div class="card text-center">
    <div class="card-body">
      <h1>Welcome to Pollster</h1>
      <p>This is an example Django polling app</p>
      <a href="{% url 'polls:index' %}" class="btn btn-dark">View available polls</a>
    </div>
  </div>
{% endblock %}
```
- Register the view and routing
```Python
# pages/views.py
from django.shortcuts import render

# Create your views here.
def index(request):
  return render(request, 'pages/index.html')
```
```Python
# pages/urls.py
from django.urls import path

from . import views 

urlpatterns = [
  path('', views.index, name='index'),
]
```
```Python
# pollster/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('pages.urls')), #<--------------
    path('polls/', include('polls.urls')),
    path('admin/', admin.site.urls),
]
```
