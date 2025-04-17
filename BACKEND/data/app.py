from flask import Flask, render_template, request
import pickle
import numpy as np
from pymongo import MongoClient

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["BookStore"]
collection = db["Book"]

# Load Pickle Files
popular_df = pickle.load(open('popular.pkl', 'rb'))
pt = pickle.load(open('pt.pkl', 'rb'))
books = pickle.load(open('books.pkl', 'rb'))
similarity_scores = pickle.load(open('similarity_scores.pkl', 'rb'))

@app.route('/recbook', methods=['GET', 'POST'])
def index():
    data = []  # Default empty list

    if request.method == 'POST':
        user_input = request.form.get('user_input')
        try:
            index = np.where(pt.index == user_input)[0][0]
            similar_items = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[1:5]

            for i in similar_items:
                item = {}
                temp_df = books[books['Book-Title'] == pt.index[i[0]]]
                
                title = temp_df.drop_duplicates('Book-Title')['Book-Title'].values[0]
                author = temp_df.drop_duplicates('Book-Title')['Book-Author'].values[0]
                image_url = temp_df.drop_duplicates('Book-Title')['Image-URL-L'].values[0]

                # Check if book exists in MongoDB
                book_exists = collection.find_one({"Book-Title": title}) is not None
                
                item["title"] = title
                item["author"] = author
                item["image_url"] = image_url
                item["exists_in_db"] = book_exists  # True or False
                
                data.append(item)
        except IndexError:
            data = []  # If book not found, return empty list

    return render_template(
        'index.html',
        book_name=list(popular_df['Book-Title'].values),  # Use popular.pkl for sidebar
        data=data
    )

if __name__ == '__main__':
    app.run(debug=True, port=3001)
