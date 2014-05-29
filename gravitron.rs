extern crate native;
extern crate rsfml;
extern crate std;

use rsfml::system::Vector2f;
use rsfml::window::{ContextSettings, VideoMode, event, Close};
use rsfml::graphics::{RenderWindow, CircleShape, Color};

#[start]
fn start(argc: int, argv: **u8) -> int {
    native::start(argc, argv, main)
}

struct Velocity {
    speed: f32,
    angle: f32
}

impl Velocity {
    fn from_vec2d(vec: Vector2f) -> Velocity {
        let speed = (vec.x*vec.x + vec.y*vec.y).sqrt();
        Velocity{speed: speed, angle: vec.y.atan2(vec.x)}
    }

    fn to_vec2d(&self) -> Vector2f {
        let (sin, cos) = self.angle.sin_cos();
        Vector2f{x: cos * self.speed, y: sin * self.speed}
    }
}

impl Add<Velocity, Velocity> for Velocity {
    fn add(&self, rhs: &Velocity) -> Velocity {
        Velocity::from_vec2d(self.to_vec2d() + rhs.to_vec2d())
    }
}

struct Ball<'r> {
    circle: CircleShape<'r>,
    vel: Velocity,
}

impl Ball {
    fn new(x, y, size, angle, speed) {
        Ball {
            circle: CircleShape{
            }
        }
    }
}

fn main () -> () {

    let objects = vec![];
    objects.push(Ball

    println!("di {}\n", 10f64.sin());

    // Create the window of the application
    let mut window = match RenderWindow::new(VideoMode::new_init(800, 600, 32), 
                                             "SFML Example", 
                                             Close, 
                                             &ContextSettings::default()) {
        Some(window) => window,
        None => fail!("Cannot create a new Render Window.")
    };

    let mut ball = Ball {
        circle: match CircleShape::new() {
                Some(circle) => circle,
                None       => fail!("Error, cannot create ball")
        },
        vel: Velocity { speed: 0., angle: 0. }
    };

    // Create a CircleShape
    ball.circle.set_radius(30.);
    ball.circle.set_fill_color(&Color::red());
    ball.circle.set_position(&Vector2f::new(100., 100.));

    while window.is_open() {
        // Handle events
        for event in window.events() {
            match event {
                event::Closed => window.close(),
                _             => {/* do nothing */}
            }
        }

        // Clear the window
        window.clear(&Color::new_RGB(0, 200, 200));
        // Draw the shape
        window.draw(&ball.circle);
        // Display things on screen
        window.display()
    }
}
