extern crate native;
extern crate rsfml;
extern crate std;
extern crate rand;
extern crate collections;

use rsfml::system::Vector2f;
use rsfml::window::{ContextSettings, VideoMode, event, Close};
use rsfml::graphics::{RenderWindow, CircleShape, Color};

use rand::random;
use collections::{HashMap};

#[start]
fn start(argc: int, argv: **u8) -> int {
    native::start(argc, argv, main)
}

struct Velocity {
    mag: f32,
    angle: f32
}

impl Velocity {
    fn new(mag: f32, angle: f32) {
        Velocity { mag: mag, angle: angle }
    }

    fn from_vec2d(vec: Vector2f) -> Velocity {
        let mag = (vec.x*vec.x + vec.y*vec.y).sqrt();
        Velocity{mag: mag, angle: vec.y.atan2(vec.x)}
    }

    fn to_vec2d(&self) -> Vector2f {
        let (sin, cos) = self.angle.sin_cos();
        Vector2f{x: cos * self.mag, y: sin * self.mag}
    }
}

impl Add<Velocity, Velocity> for Velocity {
    fn add(&self, rhs: &Velocity) -> Velocity {
        Velocity::from_vec2d(self.to_vec2d() + rhs.to_vec2d())
    }
}

enum ObjectType {
    Player,
    Simple,
    Bullet
}

#[deiving(Hash)]
struct Object<'r> {
    id: i64,
    circle: CircleShape<'r>,
    vel: Velocity,
    type: ObjectType
}

impl<'r> Eq for Object<'r> {
    fn eq(&self, Self: &Object) -> bool {
        self.id == Self.id
    }
    fn ne(&self, Self: &Object) -> bool {
        self.id != Self.id
    }
}

impl<'r> TotalEq for Object<'r> { }

fn newCircleShape(x: f32, y: f32, size: f32, color: &Color) -> CircleShape {
    let mut circle = match CircleShape::new() {
            Some(circle) => circle,
            None       => fail!("Error, cannot create ball")
    };
    circle.set_radius(size);
    circle.set_position(&Vector2f::new(x, y));
    circle.set_fill_color(color);
    circle
}

impl<'r> Object<'r> {
    fn new(id: i64, circle: CircleShape, vel: Velocity, type: ObjectType) -> Object {
        Object {
            id: id,
            circle: circle,
            vel: vel,
            type: ObjectType
        }
    }

    fn get_position(&self) -> Vector2f {
        let pos = self.circle.get_position();
        Vector2f {
            x: pos.x + self.circle.get_radius(),
            y: pos.y + self.circle.get_radius()
        }
    }

    fn move(&mut self, delta: &Vector2f) {
        self.circle.move(delta)
    }

    fn step(&mut self, game: &Game) {
        self.circle.move(&self.vel.to_vec2d());

        match self.type {
            Player => (),
            Simple => {
                let mut vel = Velocity::from_vec2d(
                    one.get_position() - two.get_position()
                );
                vel.mag = -1./vel.mag * one.circle.get_radius();
                vel
            }
        }
    }
}

/*
fn make_distance_matrix(objects: &Vec<Object>, me: &Object) {
    let mut distances = Vec::new();
    for i in range(0, objects.length()) {
        let mut line = Vec::new();
        distances.push(line);
        for j in range(0, objects.length()) {
            line.push(match i - j {
                0 => Velocity{mag: 0., angle: 0.},
                x if x < 0 => *distances.get(j).get(i),
                _ => Velocity::from_vec2d(
                        objects.get(j).get_position() -
                        objects.get(i).get_position()
                    )
            });
        }
    }
}
*/

fn gravity(one: &Object, two: &Object) -> Velocity {
    let mut vel = Velocity::from_vec2d(
        one.get_position() - two.get_position()
    );
    vel.mag = -1./vel.mag * one.circle.get_radius();
    vel
}

fn gravitateObjects(objects: &mut Vec<Object>, me: &Object) {
    for b in objects.mut_iter() {
        let grav = gravity(b, me);
        b.vel = b.vel + grav;
        if b.vel.mag > 10. {
            b.vel.mag = 10.;
        }
    }
}

fn room1(game: Game) {
    let id = game.next_id();
    game.add(id, Enemy
}

enum EnemyType {
    Simplest,
    Mobile,
    Double
}

struct EnemyDefinition {
}

struct Room {
    objects: Vector<EnemyDefinition>
}

struct Game<'r> {
    objects: HashMap<i64, Object<'r>>,
    me: Object<'r>,
    window: RenderWindow,
    cid: i64
}

impl<'r> Game<'r> {
    fn new() -> Game {
        // Create the window of the application
        let mut window = match RenderWindow::new(VideoMode::new_init(800, 600, 32), 
                                                "SFML Example", 
                                                Close, 
                                                &ContextSettings::default()) {
            Some(window) => window,
            None => fail!("Cannot create a new Render Window.")
        };

        window.set_framerate_limit(60);

        Game {
            cid: 1,
            objects: HashMap::new(),
            me: Object::new(
                0,
                400.,
                400.,
                20.,
                0., 0.,
                &Color::blue()
            ),
            window: window
        }
    }

    fn add(&mut self, one: Object<'r>) {
        self.objects.insert(one.id, one);
    }

    fn handle_events(&mut self) {
        // Handle events
        for event in self.window.events() {
            match event {
                event::Closed => self.window.close(),
                _             => {/* do nothing */}
            }
        }
    }

    fn draw(&mut self) {
        // Clear the window
        self.window.clear(&Color::new_RGB(0, 0, 0));
        // Draw the shape
        self.window.draw(&self.me.circle);
        /*
        for (_, b) in objects.mut_iter() {
            b.step();
            window.draw(&b.circle);
        }
        */
    }

    fn step(&mut self) {
        // gravitateObjects(&mut objects, &me);
        // for b in objects.mut_iter() {
            // b.step();
        // }
        self.me.step();
    }

    fn run(&mut self) {
        while self.window.is_open() {
            self.handle_events();

            self.step();
            self.draw();
            // Display things on screen
            self.window.display();
        }

    }
}

fn main () -> () {

    // let mut objects = HashMap::new();
    let mut game = Game::new();

    println!("di {}\n", 10f64.sin());

    game.run();

}
