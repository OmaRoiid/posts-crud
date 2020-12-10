import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title: title, content: content };
    this.http
      .post<{ name: string }>(
        'https://techbooks-838de-default-rtdb.firebaseio.com/posts.json',
        postData,
        {
          observe :'response'
        }
      )
      .subscribe(
        responseData => {
          console.log(responseData.body);
        },
        error => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    return this.http
      .get<{ [key: string]: Post }>(
        'https://techbooks-838de-default-rtdb.firebaseio.com/posts.json',
        {
          headers: new HttpHeaders({'Access-Control-Allow-Origin': '*'}),
          params: new HttpParams().set('print','pretty'),
          responseType: 'json'
        },
        
      )
      .pipe(
        map(responseData => {
          const postsArray: Post[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }
          return postsArray;
        }),
        catchError(errorRes => {
          // Send to analytics server
          return throwError(errorRes);
        })
      );
  }

  deletePosts() {
    return this.http.delete(
      'https://techbooks-838de-default-rtdb.firebaseio.com/posts.json',
     {
       observe:'events',
       responseType:'text'
     }).pipe(
       tap(event=>{
        if(event.type=== HttpEventType.Response){
          console.log(event.body)
        }
       })
     )
  }
}
