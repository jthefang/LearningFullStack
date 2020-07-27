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
