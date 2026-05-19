import os
import shutil
from app import app, db
from models import Room
from seed_rooms import seed_rooms

OUTPUT_DIR = 'dist'

def freeze():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)

    with app.app_context():
        db.create_all()
        if Room.query.count() == 0:
            seed_rooms()

        rooms = Room.query.filter_by(available=True).all()

        with app.test_client() as client:
            pages = {
                'index.html': '/',
                'rooms/index.html': '/rooms',
                'contact/index.html': '/contact',
                'terms/index.html': '/terms',
                'privacy/index.html': '/privacy',
            }

            for filename, route in pages.items():
                resp = client.get(route)
                filepath = os.path.join(OUTPUT_DIR, filename)
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                html = resp.data.decode('utf-8')
                html = html.replace('href="/"', 'href="/index.html"')
                with open(filepath, 'w') as f:
                    f.write(html)
                print(f'  Built {filename}')

            for room in rooms:
                resp = client.get(f'/room/{room.id}')
                filepath = os.path.join(OUTPUT_DIR, f'room/{room.id}/index.html')
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                with open(filepath, 'w') as f:
                    f.write(resp.data.decode('utf-8'))
                print(f'  Built room/{room.id}/index.html')

    shutil.copytree('static', os.path.join(OUTPUT_DIR, 'static'))
    print(f'  Copied static assets')

    with open(os.path.join(OUTPUT_DIR, '_redirects'), 'w') as f:
        f.write('/*    /index.html   200\n')

    print(f'\nDone! Static site built in {OUTPUT_DIR}/')

if __name__ == '__main__':
    freeze()
