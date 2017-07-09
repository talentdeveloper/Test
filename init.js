var workflow = new (require('events').EventEmitter)();
var async = require('async');
var prompt = require('prompt');

workflow.on('collectUserInput', function(){
  prompt.message = ''; prompt.delimiter = '';
  async.waterfall([function(cb){
    //1. admin username, email, and password
    console.log('=====Create admin user=====');
    var schema = {
      properties: {
        username: {
          description: 'username',
          type: 'string',                 // Specify the type of input to expect.
          pattern: /^\w+$/,
          message: 'Username must be letters',
          default: 'root'
        },
        email: {
          description: 'email',
          pattern: /^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/,
          message: 'Not a valid email address',
          required: true
        },
        password: {
          description: 'password',     // Prompt displayed to the user. If not supplied name will be used.
          type: 'string',                 // Specify the type of input to expect.
          pattern: /^\w+$/,                  // Regular expression that input must be valid against.
          message: 'Password must be letters', // Warning message to display if validation fails.
          hidden: true,                        // If true, characters entered will not be output to console.
          required: true
        }
      }
    };
    prompt.start();
    prompt.get(schema, function (err, result) {
      if(err){
        return cb(err);
      }
      workflow.admin = {
        username: result.username,
        email:    result.email,
        password: result.password
      };
      cb();
    });
  }, function(cb){
    //2. mongo connection
    console.log('=====Setup Mongo DB=====');
    var schema = {
      properties: {
        host: {
          description: 'MongoDB host',
          type: 'string',                 // Specify the type of input to expect.
          default: 'localhost'
        },
        port: {
          description: 'MongoDB port',
          type: 'number',
          default: 27017
        },
        database: {
          description: 'MongoDB database',
          type: 'string',
          default: 'angular-drywall'
        },
        user: {
          description: 'MongoDB user',
          type: 'string',
          default: ''
        },
        password: {
          description: 'MongoDB password',
          type: 'string',
          default: '',
          hidden: true
        }
      }
    };
    prompt.start();
    prompt.get(schema, function (err, result) {
      if(err){
        return cb(err);
      }
      workflow.mongo = {
        host: result.host,
        port: result.port,
        database: result.database,
        user: result.user? result.user: null,
        password: result.password? result.password: null
      };
      cb();
    });
  }, function(cb){
    //3. smtp email server and password
    console.log('=====(Optional) Set smtp server credential (to send notification email)=====');
    var schema = {
      properties: {
        email: {
          description: 'smtp username',
          default: workflow.admin.email
        },
        password: {
          description: 'smtp password',
          type: 'string',
          hidden: true
        },
        host: {
          description: 'smtp server host',
          type: 'string',
          default: 'smtp.gmail.com'
        }
      }
    };
    prompt.start();
    prompt.get(schema, function (err, result) {
      if(err){
        return cb(err);
      }
      workflow.smtp = {
        email:    result.email,
        password: result.password,
        host:     result.host
      };
      cb();
    });
  }], function(err, res){
    if(err){
      console.log('Error collecting config info, please try again.');
      process.exit(-1);
    }
    return workflow.emit('checkDbConnection');
  })
});


workflow.on('checkDbConnection', function(){
// Connection URL
//  var url = 'mongodb://localhost/angular-drwayll';
  var uri = ['mongodb://'];
  if(workflow.mongo.user && workflow.mongo.password){
    uri = uri.concat([workflow.mongo.user, ':', workflow.mongo.password, '@']);
  }
  uri = uri.concat([workflow.mongo.host, ':', workflow.mongo.port, '/', workflow.mongo.database]).join('');
  workflow.mongo.uri = uri;
  require('mongodb').MongoClient.connect(uri, function(err, db) {
    if(err){
      console.log('error connecting to db, please verify Mongodb setting then try again.');
      process.exit(-1);
    }else if(db){
      workflow.db = db;
    }
    return workflow.emit('initDb');
  });
});

workflow.on('initDb', function(){
  var db = workflow.db;
  async.waterfall([function(cb){
    // drop db if exists
    db.dropDatabase(function(err, result){
      return err? cb(err): cb();
    });
  }, function(cb){
    // insert one admingroup doc
    db.collection('admingroups').insert({ _id: 'root', name: 'Root' }, function(err, res){
      return err? cb(err): cb();
    });
  }, function(cb){
    //insert one property doc
    db.collection('properties').insert({ status: 'new' }, function(err, res){
      return err? cb(err): cb();
    });
  }, function(cb){
    //insert one video doc
    db.collection('videos').insert({ welcomePageURL: '', instructionURL: '', description: '', videoURL: 'yes'}, function(err, res){
      return err? cb(err): cb();
    });
  },function(cb){
    //insert one video doc
    db.collection('statustypes').insert({ statusName: '', statusDetail: ''}, function(err, res){
      return err? cb(err): cb();
    });
  },function(cb){
    // insert one admin doc
    var admins = db.collection('admins');
    admins.insert({ name: {first: 'Root', last: 'Admin', full: 'Root Admin'}, groups: ['root'] }, function(err, res){
      return err? cb(err): cb();
    });
  }, function(cb){
    // insert one account doc
    db.collection('accounts').insert({isVerified: 'yes'}, function(err, res){
      return err? cb(err): cb();
    });
  }, function(cb){
    // encrypt password
    var bcrypt = require('bcrypt');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return cb(err);
      }
      bcrypt.hash(workflow.admin.password, salt, function(err, hash) {
        cb(err, hash);
      });
    });
  }, function(hash, cb){
    // insert one user doc
    db.collection('admins').findOne(function(err, admin){
      if(err) return cb(err);
      db.collection('accounts').findOne(function(err, account){
        if(err) return cb(err);
        var user = {
          username: workflow.admin.username,
          password: hash,
          isActive: 'yes',
          email: workflow.admin.email,
          roles: {
            admin: admin._id,
            //account: account._id
            accountType: 'Admin'
          }
        };
        db.collection('users').insert(user, function(err, res){
          return cb(err, admin._id, account._id);
        });
      });
    });
  }, function(adminId, accountId, cb){
    //patch admin
    db.collection('users').findOne(function(err, user){
      if(err) {
        return cb(err);
      }
      db.collection('admins').update({_id: adminId}, {$set: { user: { id: user._id, name: user.username } }}, function(err, res){
        return cb(err, accountId, user);
      });
    });
  }, function(accountId, user, cb){
    //patch account
    db.collection('accounts').update({_id: accountId}, {$set: { user: { id: user._id, name: user.username }}}, function(err, res){
      return err? cb(err): cb();
    });
  }, function(cb){
    //insert one property doc
    db.collection('quotes').insert([
      { quoteText: 'Nothing could be worse than the fear that one had given up too soon, and left one unexpended effort that might have saved the world.',
       authorBy: 'Jane Addams' },
      { quoteText: 'Very happy to provide leads.'
      , authorBy: 'Mark Waugh' },
      { quoteText: 'You must give some time to your fellow men. Even if its a little thing, do something for others something for which you get no pay but the privilege of doing it.'
      , authorBy: '-Albert Schweitzer' },
      { quoteText: 'The secret of concentration is the secret of self discovery. You reach inside yourself to discover your personal resources, and what it takes to match them to the challenge.'
      , authorBy: '-Arnold Palmer' },
      { quoteText: 'All you have to do is look straight and see the road, and when you see it, dont sit looking at it   walk.'
      , authorBy: '-Ayn Rand' },
      { quoteText: 'The secret of concentration is the secret of self discovery. You reach inside yourself to discover your personal resources, and what it takes to match them to the challenge.'
      , authorBy: '-Arnold Palmer' },
      { quoteText: 'All you have to do is look straight and see the road, and when you see it, dont sit looking at it   walk.'
      , authorBy: '-Ayn Rand' },
      { quoteText: 'Everyones got it in him, if he will only make up his mind and stick at it. None of us is born with a stop valve on his powers or with a set limit to his capacities. There is no limit possible to the expansion of each one of us.'
      , authorBy: '-Charles M. Schwab' },
      { quoteText: 'Often the difference between a successful person and a failure is not the one that has better abilities or ideas, but the courage that one has to bet on ones ideas, to take a calculated risk   and to act.'
      , authorBy: '-Dr. Maxwell Maltz' },
      { quoteText: 'Throughout all history, the great wise men and teachers, philosophers, and prophets have disagreed with one another on many different things. It is only on this one point that they are in complete and unanimous agreement.   We become what we think about.'
      , authorBy: '-Earl Nightingale' },
      { quoteText: 'Friendship with oneself is all important, because without it one cannot be friends with anyone else in the world.'
      , authorBy: '-Eleanor Roosevelt' },
      { quoteText: 'May my faith always exceed my fears   the price is too great to go through life afraid.'
      , authorBy: '-Fortune Cookie' },
      { quoteText: 'One day at a time   this is enough. Do not look back and grieve over the past, for it is gone: and do not be troubled about the future, for it has not yet come. Live in the present, and make it so beautiful that it will be worth remembering.'
      , authorBy: '-Ida Scott Taylor' },
      { quoteText: 'There are risks and costs to a program of action. But they are far less than the long range risks and costs of comfortable inaction.'
      , authorBy: '-John F Kennedy' },
      { quoteText: 'Make it a point to rid your speech and thoughts of all forms of negative self talk.'
      , authorBy: '-Karl Albrecht' },
      { quoteText: 'I am responsible for my own well being, my own happiness. The choices and decisions I make regarding my life directly influence the quality of my days.'
      , authorBy: '-Kathleen Andrus' },
      { quoteText: 'If you want something new, you must do something different today. There is no finish line to this pursuit; you should always be planning for what is possible. Diligence, planning, knowing what you want   these are what it takes to get to a better place. Opportunities swirl around this planet constantly. I am sure that if each of us felt we deserved the best, we would believe more in ourselves, and in others, and in all that is out there to share, and we would reach out for a handful of that opportunity.'
      , authorBy: '-Loral Langemeier' },
      { quoteText: 'You cannot keep determined people from success. If you place stumbling blocks in their way, they will use them for stepping stones and climb to new heights.'
      , authorBy: '-Mary Kay Ash' },
      { quoteText: 'Champions are not made in the gyms. Champions are made from something they have deep inside them   a desire, a dream, a vision.'
      , authorBy: '-Muhammad Ali' },
      { quoteText: 'There is a way to look at the past. Do not hide from it. It will not catch you   if you do not repeat it.'
      , authorBy: '-Pearl Bailey' },
      { quoteText: 'My philosophy of life is that if we make up our mind what we are going to make of our lives, then work hard toward that goal, we never lose   somehow we win out.'
      , authorBy: '-Ronald Reagan' },
      { quoteText: 'If criticism is mistaken or mean spirited, rise above it. Maintain the high ground when you are under fire. No victory is worth winning at the expense of picking up the mud that has been slung at you and throwing it back.'
      , authorBy: '-Rubel Shelly' },
      { quoteText: 'Peace means loyalty to self   and loyalty to ones self means never a gap between thought, speech and act.'
      , authorBy: '-Ruth Beebe Hill' },
      { quoteText: 'It is time for us all to stand and cheer for the doer, the achiever   the one who recognizes the challenges and does something about it.'
      , authorBy: '-Vince Lombardi' },
      { quoteText: 'Present moment living, getting in touch with your now, is at the heart of effective living. When you think about it, there really is no other moment you can live. Now is all there is, and the future is just another present moment to live when it arrives. One thing is certain, you cannot live it until it does appear.'
      , authorBy: '-Wayne Dyer' },
      { quoteText: 'People often say that motivation does not last. Well, neither does bathing   that is why we recommend it daily.'
      , authorBy: '-Zig Ziglar' },
      { quoteText: 'A fresh mind keeps the body fresh. Take in the ideas of the day, drain off those of yesterday. As to the morrow, time enough to consider it when it becomes today.   Edward G. Bulwer'
      , authorBy: '-Lytton' },
      { quoteText: 'What is important is not what happens to us, but how we respond to what happens to us.'
      , authorBy: '-Jean Paul Sartre' },
      { quoteText: 'Should you shield the canyons from the windstorms, you would not see the beauty of their carvings.   Elisabeth Kubler'
      , authorBy: '-Ross' },
      { quoteText: 'No man for any considerable period can wear one face to himself and another to the multitude, without finally getting bewildered as to which may be the true. '
      , authorBy: '-Nathaniel Hawthorne' },
      { quoteText: 'The more tranquil a man becomes, the greater is his success, his influence, his power for good. Calmness of mind is one of the beautiful jewels of wisdom.'
      , authorBy: '-James Allen' },
      { quoteText: 'Persistence is what makes the impossible possible, the possible likely, and the likely definite.'
      , authorBy: '-Robert Half' },
      { quoteText: 'It is our attitude at the beginning of a difficult task which, more than anything else, will affect its successful outcome.'
      , authorBy: '-William James' },
      { quoteText: 'Never continue in a job you don not enjoy. If you are happy in what you are doing, you will like yourself, you will have inner peace. And if you have that, along with physical health, you will have had more success than you could possibly have imagined.'
      , authorBy: '-Johnny Carson' },
      { quoteText: 'Concentrate all your thoughts upon the work at hand. The suns rays do not burn until brought to a focus.'
      , authorBy: '-Alexander Graham Bell' },
      { quoteText: 'A life spent in making mistakes is not only more honorable but more useful than a life spent doing nothing.'
      , authorBy: '-George Bernard Shaw' },
      { quoteText: 'Those who are not looking for happiness are the most likely to find it, because those who are seeking forget that the surest way to be happy is to seek happiness for others.'
      , authorBy: '-Martin Luther King, Jr.' },
      { quoteText: 'If you have a positive attitude and constantly strive to give your best effort, eventually you will overcome your immediate problems and find you are ready for greater challenges.'
      , authorBy: '-Pat Riley' },
      { quoteText: 'Character cannot be developed in ease and quiet. Only through experience of trial and suffering can the soul be strengthened, vision cleared, ambition inspired, and success achieved.'
      , authorBy: '-Helen Keller' },
      { quoteText: 'I find television very educating. Every time somebody turns on the set, I go into the other room and read a book.'
      , authorBy: '-Groucho Marx' },
      { quoteText: 'Our worst fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure. It is our light, not our darkness that most frightens us. We ask ourselves, who am I to be brilliant, gorgeous, talented and fabulous? Actually, who are you not to be?'
      , authorBy: '-Marianne Williamson' },
      { quoteText: 'There are two big forces at work, external and internal. We have very little control over external forces such as tornadoes, earthquakes, floods, disasters, illness and pain. What really matters is the internal force. How do I respond to those disasters? Over that I have complete control.'
      , authorBy: '-Leo Buscaglia' },
      { quoteText: 'The purpose of learning is growth, and our minds, unlike our bodies, can continue growing as we continue to live.'
      , authorBy: '-Mortimer J. Adler' },
      { quoteText: 'The indispensable first step to getting the things you want out of life is this: Decide what you want.'
      , authorBy: '-Ben Stein' },
      { quoteText: 'There are no hopeless situations; there are only people who have grown hopeless about them.'
      , authorBy: '-Clare Boothe' },
      { quoteText: 'It is a sign of troubled times when the concept of pressure becomes an acceptable excuse for ethical shortcuts. Pressures are just temptations in disguise and it is never been acceptable to give in to temptation.'
      , authorBy: '-Michael Josephson' },
      { quoteText: 'I am an old man and have known a great many troubles, but most of them never happened.'
      , authorBy: '-Mark Twain' },
      { quoteText: 'It is not the will to win, but the will to prepare to win that makes the difference.'
      , authorBy: '-Bear Bryant' },
      { quoteText: 'He was not a born king of men...but a child of the common people, who made himself a great persuader, therefore a leader, by dint of firm resolve, patient effort and dogged perseverance...He was open to all impressions and influences and gladly profited by the teachings of events and circumstances no matter how adverse or unwelcome. There was probably no year of his life when his was not a wiser, cooler and better man than he had been the year preceding.'
      , authorBy: '-Horace Greeley on Abraham Lincoln' },
      { quoteText: 'No person was ever honored for what he received. Honor has been the reward for what he gave.'
      , authorBy: '-Calvin Coolidge' },
      { quoteText: 'When you rule your mind you rule your world. When you choose your thoughts you choose results.'
      , authorBy: '-Imelda Shanklin' },
      { quoteText: 'Never be afraid to ask a question, especially of yourself. Discovery is the mission of life.'
      , authorBy: '-Brian Kates' },
      { quoteText: 'Few will have the greatness to bend history itself, but each of us can work to change a small portion of events, and in the total of all those acts will be written the history of this generation.'
      , authorBy: '-John F. Kennedy' },
      { quoteText: 'You are the only problem you will ever have and you are the only solution. Change is inevitable, personal growth is always a personal decision.'
      , authorBy: '-Bob Proctor' },
      { quoteText: 'Great works are performed not by strength, but by perseverance.'
      , authorBy: '-Samuel Johnson' },
      { quoteText: 'The strongest oak tree of the forest is not the one that is protected from the storm and hidden from the sun. It is the one that stands in the open where it is compelled to struggle for its existence against the winds and rains and the scorching sun.'
      , authorBy: '-Napoleon Hill' },
      { quoteText: 'Lead the life that will make you kindly and friendly to everyone about you, and you will be surprised what a happy life you will lead.'
      , authorBy: '-Charles M. Schwab' },
      { quoteText: 'The greater danger for most of us lies not in setting our aim too high and falling short; but in setting our aim too low, and achieving our mark.'
      , authorBy: '-Michelangelo' },
      { quoteText: 'The art of living lies less in eliminating our troubles than in growing with them.'
      , authorBy: '-Bernard Baruch' },
      { quoteText: 'The self explorer, whether he wants to or not, becomes the explorer of everything else.'
      , authorBy: '-Elias Canetti' },
      { quoteText: 'Either control your destiny or someone else will.'
      , authorBy: '-John F. Welch Jr.' },
      { quoteText: 'Minds are like parachutes, they only function when they are open.'
      , authorBy: '-Sir James Dewar' },
      { quoteText: 'Mindfulness places us where choice is possible; the greater our awareness, the greater our freedom to choose.'
      , authorBy: '-Gil Fronsdal' },
      { quoteText: 'The greatest gifts my parents gave to me were their unconditional love and a set of values. Values that they lived and did not just lecture about.'
      , authorBy: '-Colin Powell' },
      { quoteText: 'He who believes is strong; he who doubts is weak. Strong convictions precede great actions.'
      , authorBy: '-James Freeman Clarke' },
      { quoteText: 'To listen is to know for a moment. To hear is to know forever.'
      , authorBy: '-Dana Cowley' },
      { quoteText: 'You cannot always control your circumstances, but you can always control your own thoughts.'
      , authorBy: '-Charles E. Popplestone' },
      { quoteText: 'Failure is a necessary part of learning, and to me each day is an opportunity to learn. You do not get character because you are successful, you get character because of the hardships you face.'
      , authorBy: '-Herman Edwards' },
      { quoteText: 'If you look for the truth outside yourself, it gets farther and farther away.'
      , authorBy: '-Tung Shan' },
      { quoteText: 'I lived in solitude in the country and noticed how the monotony of a quiet life stimulates the creative mind.'
      , authorBy: '-Albert Einstein' },
      { quoteText: 'Laugh at yourself, but do not ever aim your doubt at yourself. Be bold. When you embark for strange places, do not leave any of yourself safely on shore. Have the nerve to go into unexplored territory.'
      , authorBy: '-Wayne Rogers' },
      { quoteText: 'An invincible determination can accomplish almost anything and in this lies the great distinction between great men and little men.'
      , authorBy: '-Thomas Fuller' },
      { quoteText: 'When we change our perception we gain control. Stress becomes a challenge, not a threat. When we commit to action, to actually doing something rather than feeling trapped by events, the stress in our life becomes manageable.'
      , authorBy: '-Greg Anderson' },
      { quoteText: 'Some people have greatness thrust upon them. Few have excellence thrust upon them...They achieve it. They do not achieve it unwittingly by doing what comes naturally and they do not stumble into it in the course of amusing themselves. All excellence involves discipline and tenacity of purpose.'
      , authorBy: '-John William Gardner' },
      { quoteText: 'One kernel is felt in a hogshead; one drop of water helps to swell the ocean; a spark of fire helps to give light to the world. None are too small, too feeble, too poor to be of service. Think of this and act.'
      , authorBy: '-Hannah More' },
      { quoteText: 'You are never given a dream without also being given the power to make it true.'
      , authorBy: '-Richard Bach' },
      { quoteText: 'How much better to get wisdom than gold. To get understanding is to be chosen rather than silver.'
      , authorBy: '-Proverbs' },
      { quoteText: 'There are two primary choices in life: to accept conditions as they exist, or accept the responsibility for changing them.'
      , authorBy: '-Denis Waitley' },
      { quoteText: 'When I examine myself and my methods of thought, I come to the conclusion that the gift of fantasy has meant more to me than my talent for absorbing positive knowledge.'
      , authorBy: '-Albert Einstein' },
      { quoteText: 'Be careful the environment you choose for it will shape you; be careful the friends you choose for you will become like them.'
      , authorBy: '-W. Clement Stone' },
      { quoteText: 'Ones philosophy is not best expressed in words; it is expressed in the choices one makes. In the long run, we shape our lives and we shape ourselves. The process never ends until we die. And, the choices we make are ultimately our own responsibility.'
      , authorBy: '-Eleanor Roosevelt' },
      { quoteText: 'You will become as small as your controlling desire; as great as your dominant aspiration.'
      , authorBy: '-James Allen' },
      { quoteText: 'Promise yourself to be so strong that nothing can disturb your peace of mind. To talk health, happiness and prosperity to every person you meet. To make all your friends feel that there is something in them. To look at the sunny side of everything and make your optimism come true. To think only of the best, to work only for the best and expect only the best. To be just as enthusiastic about the success of others that you are about your own. To forget the mistakes of the past and press on to the greater achievements of the future. To wear a cheerful countenance of all times and give every livin'
      , authorBy: '-Christian D. Larsen' },
      { quoteText: 'I have simply tried to do what seemed best each day, as each day came.'
      , authorBy: '-Abe Lincoln' },
      { quoteText: 'The greatest discovery of my generation is that human beings can alter their lives by altering their attitudes of mind.'
      , authorBy: '-William James' },
      { quoteText: 'Better to remain silent and be thought a fool than to speak out and remove all doubt.'
      , authorBy: '-Abe Lincoln' },
      { quoteText: 'Worry does not empty tomorrow of its sorrow; it empties today of its strength.'
      , authorBy: '-Corrie Bloom' },
      { quoteText: 'The beginning of a habit is like an invisible thread, but every time we repeat the act we strengthen the strand, add to it another filament, until it becomes a great cable and binds us irrevocably in thought and act.'
      , authorBy: '-Orison Swett Marden' },
      { quoteText: 'Look at a day when you are supremely satisfied at the end. It is not a day when you lounge around doing nothing; it is when you have had everything to do, and you have done it.'
      , authorBy: '-Margaret Thatcher' },
      { quoteText: 'Doubt, of whatever kind, can be ended by action alone.'
      , authorBy: '-Thomas Carlyle' },
      { quoteText: 'Cherish your visions and your dreams as they are the children of your soul; the blue prints of your ultimate achievements.'
      , authorBy: '-Napoleon Hill' },
      { quoteText: 'We lift ourselves by our thought. If you want to enlarge your life, you must first enlarge your thought of it and of yourself. Hold the ideal of yourself as you long to be, always everywhere.'
      , authorBy: '-Orison Swett Marden' },
      { quoteText: 'When you give someone a book, you do not give him just paper, ink, and glue. You give him the possibility of a whole new life.'
      , authorBy: '-Christopher Morley' },
      { quoteText: 'Do not blame others for your failure to be fully accountable for your own life. If others are to blame then you have given them control.'
      , authorBy: '-Bob Perks' },
      { quoteText: 'Begin to free yourself at once by doing all that is possible with the means you have, and as you proceed in this spirit the way will open for you to do more.'
      , authorBy: '-Robert Collier' },
      { quoteText: 'Face your deficiencies and acknowledge them; but do not let them master you. Let them teach you patience, sweetness, insight... When we do the best we can, we never know what miracle is wrought in our life, or in the life of another.'
      , authorBy: '-Helen Keller' },
      { quoteText: 'Words are nothing but words; power lies in deeds. Be a person of action.'
      , authorBy: '-Mali Oriot Mamadu Konyate' },
      { quoteText: 'Imagination is more important than knowledge. For knowledge is limited to all we now know and understand, while imagination embraces the entire world, and all there ever will be to know and understand.'
      , authorBy: '-Albert Einstein' },
      { quoteText: 'Ability may get you to the top, but it takes character to keep you there.'
      , authorBy: '-John Wooden' },
      { quoteText: 'Do not wait; the time will never be just right. Start where you stand, and work with whatever tools you may have at your command, and better tools will be found as you go along.'
      , authorBy: '-Napoleon Hill' },
      { quoteText: 'To create you must quiet your mind. You need a quiet mind so that ideas will have a chance of connecting.'
      , authorBy: '-Eric Maisil' },
      { quoteText: 'People seem not to see that their opinion of the world is also a confession of character.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'The majority of men meet with failure because of their lack of persistence in creating new plans to take the place of those which fail.'
      , authorBy: '-Napoleon Hill' },
      { quoteText: 'A merry heart doeth good like a medicine.'
      , authorBy: '-Fortune Cookie' },
      { quoteText: 'I do not know the key to success, but the key to failure is to try to please everyone.'
      , authorBy: '-Bill Cosby' },
      { quoteText: 'There has never yet been a man in our history who led a life of ease whose name is worth remembering.'
      , authorBy: '-Theodore Roosevelt' },
      { quoteText: 'To look backward for a while is to refresh the eye, to restore it, and to render it the more fit for its prime function of looking forward.'
      , authorBy: '-Margaret Barber' },
      { quoteText: 'The heart that gives...gathers.'
      , authorBy: '-English Proverb' },
      { quoteText: 'Inside yourself or outside, you never have to change what you see, only the way you see it.'
      , authorBy: '-Thaddeus Golas' },
      { quoteText: 'First, have a definite, clear practical idea; a goal, an objective. Second, have the necessary means to achieve your ends; wisdom, money, materials, and methods. Third, adjust all your means to that end.'
      , authorBy: '-Aristotle' },
      { quoteText: 'Those who fight fire with fire burn their houses down twice as fast.'
      , authorBy: '-Vietnamese Proverb' },
      { quoteText: 'You have got to get to the stage in life where going for it is more important than winning or losing.'
      , authorBy: '-Arthur Ashe' },
      { quoteText: 'I have had a few arguments with people, but I never carry a grudge. You know why? While you are carrying a grudge, they are out dancing.'
      , authorBy: '-Buddy Hackett' },
      { quoteText: 'The value of all our daily efforts is greater and more enduring if they create in each one of us a person who grows and understands and really lives.'
      , authorBy: '-Vince Lombardi' },
      { quoteText: 'If you want your life to be more rewarding, you have to change the way you think.'
      , authorBy: '-Oprah Winfrey' },
      { quoteText: 'Ones dignity may be assaulted, vandalized and cruelly mocked, but cannot be taken away unless it is surrendered.'
      , authorBy: '-Michael J. Fox' },
      { quoteText: 'Bitterness imprisons life; love releases it. Bitterness paralyzes life; love empowers it. Bitterness sours life; love sweetens it. Bitterness sickens life; love heals it. Bitterness blinds life; love anoints its eyes.'
      , authorBy: '-Harry Emerson Fosdick' },
      { quoteText: 'Believe in yourself and there will come a day when others will have no choice but to believe with you.'
      , authorBy: '-Cynthia Kersey' },
      { quoteText: 'I am very determined and stubborn. There is a desire in me that makes me want to do more and more, and to do it right. Each one of us has a fire in our heart for something. It is our goal in life to find it and to keep it lit.'
      , authorBy: '-Mary Lou Retton' },
      { quoteText: 'No one is in control of your happiness but you; therefore, you have the power to change anything about yourself or your life that you want to change.'
      , authorBy: '-Barbara DeAngelis' },
      { quoteText: 'Difficulty is the excuse history never accepts.'
      , authorBy: '-Edward R. Murrow' },
      { quoteText: 'Do not be distracted by criticism. Remember the only taste of success some people have is when they take a bite out of you.'
      , authorBy: '-Zig Ziglar' },
      { quoteText: 'When you speak of someone or about someone, you should speak as though they were in the room with you. The ears that you speak to today are attached to the mouth that could relay the message tomorrow.'
      , authorBy: '-William Biddy Allen' },
      { quoteText: 'No one ever attains very eminent success by simply doing what is required of him; it is the amount and excellence of what is over and above the required that determines the greatness of ultimate distinction.'
      , authorBy: '-Charles Kendall Adams' },
      { quoteText: 'The critical ingredient is getting off your butt and doing something. It is as simple as that. A lot of people have ideas, but there are few who decide to do something about them now. Not tomorrow. Not next week. But today. The true entrepreneur is a doer, not a dreamer.'
      , authorBy: '-Nolan Bushnell' },
      { quoteText: 'Nature has given us two ears but only one mouth.'
      , authorBy: '-Benjamin Disraeli' },
      { quoteText: 'The more and more you listen, the more and more you will hear. The more you hear, the more and more deeply you will understand.'
      , authorBy: '-Khyentse Rinpoche' },
      { quoteText: 'Each day, and the living of it, has to be a conscious creation in which discipline and order are relieved with some play and pure foolishness.'
      , authorBy: '-May Sarton' },
      { quoteText: 'Virtue is more clearly shown in the performance of fine actions than in the nonperformance of base ones.'
      , authorBy: '-Aristotle' },
      { quoteText: 'It was not raining when Noah built the ark.'
      , authorBy: '-Howard Ruff' },
      { quoteText: 'Whether or not we realize it each of us has within us the ability to set some kind of example for people. Knowing this would you rather be the one known for being the one who encouraged others, or the one who inadvertently discouraged those around you?'
      , authorBy: '-Josh Hinds' },
      { quoteText: 'Failure will never overtake me if my determination to succeed is strong enough.'
      , authorBy: '-Og Mandino' },
      { quoteText: 'The world can change in an instant. So can the way you choose to see it. Why not choose to see the good in yourself and others.'
      , authorBy: '-Bob Perks' },
      { quoteText: 'You were intended not only to work, but to rest, laugh, play, and have proper leisure and enjoyment.'
      , authorBy: '-Grenville Kleiser' },
      { quoteText: 'People who consider themselves victims of their circumstances will always remain victims unless they develop a greater vision for their lives.'
      , authorBy: '-Stedman Graham' },
      { quoteText: 'The fast pace of our lives makes it difficult for us to find grace in the present moment, and when the simple gifts at our fingertips cease to nourish us, we have a tendency to crave the sensational.'
      , authorBy: '-Macrina Wiederkehr' },
      { quoteText: 'Your enthusiasm will be infectious, stimulating and attractive to others. They will love you for it. They will go for you and with you.'
      , authorBy: '-Norman Vincent Peale' },
      { quoteText: 'Gratitude unlocks the fullness of life. It turns what we have into enough, and more. It turns denial into acceptance, chaos to order, confusion to clarity. It can turn a meal into a feast, a house into a home, a stranger into a friend. Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.'
      , authorBy: '-Melody Beattie' },
      { quoteText: 'Even the most daring and accomplished people have undergone tremendous difficulty. In fact, the more successful they became, the more they attributed their success to the lessons learned during their most difficult times.'
      , authorBy: '-Barbara Rose' },
      { quoteText: 'Our ultimate freedom is the right and power to decide how anybody or anything outside ourselves will affect us.'
      , authorBy: '-Stephen R. Covey' },
      { quoteText: 'An idea is never given to you without you being given the power to make it reality.'
      , authorBy: '-Richard Bach' },
      { quoteText: 'Life is not complex. We are complex. Life is simple, and the simple thing is the right thing.'
      , authorBy: '-Oscar Wilde' },
      { quoteText: 'Never tell people to do things. Tell them what to do and they will surprise you with their ingenuity.'
      , authorBy: '-George Patton' },
      { quoteText: 'Everyone has inside of him a piece of good news. The good news is that you do not know how great you can be! How much you can love! What you can accomplish! And what your potential is!'
      , authorBy: '-Anneliese Marie Frank' },
      { quoteText: 'Only the strongest egos escape the trap of perfectionism. To solve problems successfully, you must believe you can, must feel capable enough to improvise. Yet too many adults have been schooled away from their ability to experiment freely.'
      , authorBy: '-Marsha Sinetar' },
      { quoteText: 'Every great work, every great accomplishment, has been brought into manifestation through holding to the vision, and often just before the big achievement, comes apparent failure and discouragement.'
      , authorBy: '-Florence Scovel Shinn' },
      { quoteText: 'What you risk reveals what you value.'
      , authorBy: '-Jeannette Winterson' },
      { quoteText: 'There is something greater and purer than what the mouth utters. Silence illuminates our souls, whispers to our hearts, and brings them together. Silence separates us from ourselves, makes us sail the firmament of spirit, and brings us closer to heaven.'
      , authorBy: '-Kahlil Gibran' },
      { quoteText: 'Lots of people limit their possibilities by giving up easily. Never tell yourself this is too much for me. It is no use. I can not go on. If you do you are licked, and by your own thinking too. Keep believing and keep on keeping on.'
      , authorBy: '-Norman Vincent Peale' },
      { quoteText: 'I have always struggled to achieve excellence. One thing that cycling has taught me is that if you can achieve something without a struggle it is not going to be satisfying.'
      , authorBy: '-Greg LeMond' },
      { quoteText: 'The only thing that stands between a man and what he wants from life is often merely the will to try it and the faith to believe that it is possible.'
      , authorBy: '-Richard M. DeVos' },
      { quoteText: 'Whatever you want in life, other people are going to want it too. Believe in yourself enough to accept the idea that you have an equal right to it.'
      , authorBy: '-Diane Sawyer' },
      { quoteText: 'Stand up to your obstacles and do something about them. You will find that they have not half the strength you think they have.'
      , authorBy: '-Norman Vincent Peale' },
      { quoteText: 'Good humor is a tonic for mind and body. It is the best antidote for anxiety and depression. It is a business asset. It attracts and keeps friends. It lightens human burdens. It is the direct route to serenity and contentment.'
      , authorBy: '-Grenville Kleiser' },
      { quoteText: 'Dreaming is a muscle, you need to exercise it. Just like any other muscle in your body, when you do not use it, it atrophies..'
      , authorBy: '-Daena Giardella' },
      { quoteText: 'If we are basically positive in attitude, expecting and envisioning pleasure, satisfaction and happiness, we will attract and create people, situations, and events which conform to our positive expectations.'
      , authorBy: '-Shakti Gawain' },
      { quoteText: 'If you watch how nature deals with adversity, continually renewing itself, you can not help but learn.'
      , authorBy: '-Bernie Siegel, MD' },
      { quoteText: 'I do not know anyone who has gotten to the top without hard work. That is the recipe. It will not always get you to the top, but it will get you pretty near.'
      , authorBy: '-Margaret Thatcher' },
      { quoteText: 'Your living is determined not so much by what life brings you as by the attitude you bring to life; not so much by what happens to you as by the way your mind looks at what happens.'
      , authorBy: '-Lewis L. Dunnington' },
      { quoteText: 'Four short words sum up what has lifted most successful individuals above the crowd: a little bit more. They did all that was expected of them and a little bit more.'
      , authorBy: '-A. Lou Vickery' },
      { quoteText: 'Reach for the high apples first; you can get the low ones anytime.'
      , authorBy: '-Fortune Cookie' },
      { quoteText: 'Do not fight a problem, solve it!'
      , authorBy: '-Millard Fuller' },
      { quoteText: 'I always have this innate desire to do my best. Being the best is not as important to me as doing my best. I cannot go to sleep with a clear conscience knowing that I cheated myself in the slightest way, so that drives me more than anything!'
      , authorBy: '-NY Jet Curtis Martin' },
      { quoteText: 'Good timber does not grow with ease; the stronger the wind, the stronger the trees.'
      , authorBy: '-J. Willard Marriott' },
      { quoteText: 'Behold the turtle: He only makes progress when he sticks his neck out.'
      , authorBy: '-James Bryant Conant' },
      { quoteText: 'I learned so much, so very much about myself in defeat. I have learned very little to nothing in victory.'
      , authorBy: '-Floyd Patterson' },
      { quoteText: 'Courage is the enforcing virtue, the one that makes possible all the other virtues common to exceptional leaders: honesty, integrity, confidence, compassion, and humility.'
      , authorBy: '-John McCain' },
      { quoteText: 'When you help someone up the hill you get that much closer to the top yourself.'
      , authorBy: '-Anonymous' },
      { quoteText: 'Nothing will ever be attempted if all possible objections must first be overcome.'
      , authorBy: '-Samuel Johnson' },
      { quoteText: 'Things turn out best for the people who make the best of the way things turn out.'
      , authorBy: '-Art Linkletter' },
      { quoteText: 'Plenty of people miss their share of happiness, not because they never found it, but because they did not stop to enjoy it.'
      , authorBy: '-William Feather' },
      { quoteText: 'If you must compromise, compromise up.'
      , authorBy: '-Eleanor Roosevelt' },
      { quoteText: 'If things are not going well with you, begin your effort at correcting the situation by carefully examining the service you are rendering, and especially the spirit in which you are rendering it.'
      , authorBy: '-Roger Babson' },
      { quoteText: 'Pain is temporary. It may last a minute, or an hour, or a day, or a year, but eventually it will subside and something else will take its place. If I quit, however, it lasts forever.'
      , authorBy: '-Lance Armstrong' },
      { quoteText: 'Great hearts steadily send forth the secret forces that incessantly draw great events.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'Life is difficult. This is a great truth, one of the greatest truths. It is a great truth because once we truly see this truth, we can transcend it.'
      , authorBy: '-M. Scott Peck' },
      { quoteText: 'There are two things to aim at in life: First, to get what you want and, after that, to enjoy it. Only the wisest of mankind achieve the second.'
      , authorBy: '-Logan Pearsall Smith' },
      { quoteText: 'One of the secrets of getting more done is to make a TO DO List every day, keep it visible, and use it as a guide to action as you go through the day.'
      , authorBy: '-Alan Lakein' },
      { quoteText: 'Persistent people begin their success where others end in failure.'
      , authorBy: '-Edward Eggleston' },
      { quoteText: 'The happiness of a person in this life does not consist in the absence but in the mastery of their passions.'
      , authorBy: '-Alfred Lord Tennyson' },
      { quoteText: 'The bravest thing you can do when you are not brave is to profess courage and act accordingly.'
      , authorBy: '-Corra May Harris' },
      { quoteText: 'Realize that true happiness lies within you. Waste no time and effort searching for peace and contentment and joy in the world outside. Remember that there is no happiness in having or in getting, but only in giving. Reach out. Share. Smile. Hug. Happiness is a perfume you cannot pour on others without getting a few drops on yourself.'
      , authorBy: '-Og Mandino' },
      { quoteText: 'I think what I represent is achieving what you want in life. It is a matter of your attitude. Some people have a negative attitude, and that is their disability.'
      , authorBy: '-Marla Runyan' },
      { quoteText: 'You must go after your wish. As soon as you start to pursue a dream, your life wakes up and everything has meaning.'
      , authorBy: '-Barbara Sher' },
      { quoteText: 'A life of reaction is a life of slavery, intellectually and spiritually. One must fight for a life of action, not reaction.'
      , authorBy: '-Rita Mae Brown' },
      { quoteText: 'The price of success is hard work, dedication to the job at hand, and the determination that whether we win or lose, we have applied the best of ourselves to the task at hand.'
      , authorBy: '-Vince Lombardi' },
      { quoteText: 'Man often becomes what he believes himself to be. If I keep on saying to myself that I cannot do a certain thing, it is possible that I may end by really becoming incapable of doing it. On the contrary, if I shall have the belief that I can do it, I shall surely acquire the capacity to do it, even if I may not have it at the beginning.'
      , authorBy: '-Mahatma Gandhi' },
      { quoteText: 'By your thoughts you are daily, even hourly, building your life; you are carving your destiny.'
      , authorBy: '-Ruth Barrick Golden' },
      { quoteText: 'The place to improve the world is first in ones heart and head and hands, and then work outward from there.'
      , authorBy: '-Robert M. Pirsig' },
      { quoteText: 'Continuous effort ? not strength or intelligence ? is the key to unlocking our potential.'
      , authorBy: '-Winston Churchill' },
      { quoteText: 'People will try to tell you that all the great opportunities have been snapped up. In reality, the world changes every second, blowing new opportunities in all directions, including yours.'
      , authorBy: '-Ken Hakuta' },
      { quoteText: 'Prosperity proves the fortunate; adversity the great.'
      , authorBy: '-Pliny the Younger' },
      { quoteText: 'Only one thing has to change for us to know happiness in our lives: where we focus our attention.'
      , authorBy: '-Greg Anderson' },
      { quoteText: 'Defeat is not the worst of failures. Not to have tried is the true failure.'
      , authorBy: '-George E. Woodberry' },
      { quoteText: 'People are always blaming their circumstances for what they are. I do not believe in circumstances. The people who get on in this world are the people who get up and look for the circumstances they want, and if they cannot find them, make them.'
      , authorBy: '-George Bernard Shaw' },
      { quoteText: 'If you do not know what your priorities are, someone else will determine them for you.'
      , authorBy: '-Judy Suiter' },
      { quoteText: 'The road to success is filled with many obstacles.'
      , authorBy: '-Anonymous' },
      { quoteText: 'Success in the knowledge economy comes to those who know themselves, their strengths, their values and how best to perform.'
      , authorBy: '-Peter Drucker' },
      { quoteText: 'Effective people do not just do things differently; they do different things.'
      , authorBy: '-Stephen Covey' },
      { quoteText: 'Leaders are not born, they are made. And they are made just like anything else, through hard work.'
      , authorBy: '-Vince Lombardi' },
      { quoteText: 'Have patience with all things but first with yourself. Never confuse your mistakes with your value as a human being. You are a perfectly valuable, creative, worthwhile person simply because you exist. And no amount of triumphs or tribulations can ever change that. Unconditional self acceptance is the core of a peaceful mind.'
      , authorBy: '-St. Francis de Sales' },
      { quoteText: 'The one unchangeable certainty is that nothing is certain or unchangeable.'
      , authorBy: '-John F. Kennedy' },
      { quoteText: 'The fishermen know that the sea is dangerous and the storm terrible, but they have never found these dangers sufficient reason for remaining ashore.'
      , authorBy: '-Vincent van Gogh' },
      { quoteText: 'You are going to make mistakes in life. It is what you do after the mistakes that counts.'
      , authorBy: '-Brandi Chastain' },
      { quoteText: 'Achievement is largely the product of steadily raising ones level of aspiration and expectation.'
      , authorBy: '-Jack Nicklaus' },
      { quoteText: 'I can feel guilty about the past, apprehensive about the future, but only in the present can I act. The ability to be in the present moment is a major component of mental wellness.'
      , authorBy: '-Abraham Maslow' },
      { quoteText: 'What does not destroy me, makes me stronger'
      , authorBy: '-Friedrich Nietzsche' },
      { quoteText: ' Example is not the main thing in influencing others. It is the only thing'
      , authorBy: '-Albert Schweitzer' },
      { quoteText: 'You may be disappointed if you fail, but you are doomed if you do not try.'
      , authorBy: '-Beverly Sills' },
      { quoteText: 'While no road is ever straight, dedication and persistence will always lead you to your dreams.'
      , authorBy: '-Arte Moreno' },
      { quoteText: 'To solve big problems you have to be willing to do unpopular things.'
      , authorBy: '-Lee Iacocca' },
      { quoteText: 'The person who goes farthest is generally the one who is willing to do and dare.'
      , authorBy: '-Dale Carnegie' },
      { quoteText: 'Whatever course you decide upon, there is always someone to tell you that you are wrong. There are always difficulties arising which tempt you to believe that your critics are right. To map out a course of action and follow it to an end requires...courage.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'Before you begin a thing remind yourself that difficulties and delays quite impossible to foresee are ahead...You can only see one thing clearly, and that is your goal. Form a mental vision of that and cling to it through thick and thin.'
      , authorBy: '-Kathleen Norris' },
      { quoteText: 'I know the price of success: dedication, hard work and an unremitting devotion to the things you want to see happen.'
      , authorBy: '-Frank Lloyd Wright' },
      { quoteText: 'People underestimate their capacity for change. There is never a right time to do a difficult thing.'
      , authorBy: '-John Porter' },
      { quoteText: 'Excellence is not an exception, it is a prevailing attitude.'
      , authorBy: '-Colin L. Powell' },
      { quoteText: 'It is always too soon to quit.'
      , authorBy: '-Norman Vincent Peale' },
      { quoteText: 'Start by doing what is necessary, then do what is possible, and suddenly you are doing the impossible.'
      , authorBy: '-St. Francis of Assisi' },
      { quoteText: 'Happiness is to be found along the way, not at the end of the road, for then the journey is over and it is too late. Today, this hour, this minute is the day, the hour, the minute for each of us to sense the fact that life is good, with all of its trials and troubles, and perhaps more interesting because of them.'
      , authorBy: '-Robert R. Updegraff' },
      { quoteText: 'Obstacles can not stop you. Problems can not stop you. Most of all, other people can not stop you. Only you can stop you.'
      , authorBy: '-Jeffrey Gitomer' },
      { quoteText: 'The best opportunities in life are the ones we create. Goal setting provides for you the opportunity to create an extraordinary life.'
      , authorBy: '-Gary Ryan Blair' },
      { quoteText: 'Any mans life will be filled with constant and unexpected encouragement if he makes up his mind to do his level best each day.'
      , authorBy: '-Booker T. Washington' },
      { quoteText: 'When we can begin to take our failures seriously, it means we are ceasing to be afraid of them. It is of immense importance to learn to laugh at ourselves.'
      , authorBy: '-Katherine Mansfield' },
      { quoteText: 'The man who removes a mountain begins by carrying away small stones.'
      , authorBy: '-Chinese Proverb' },
      { quoteText: 'Good plans shape good decisions. That is why good planning helps to make elusive dreams come true.'
      , authorBy: '-Lester Bittle' },
      { quoteText: 'Never give in, never give in, never, never, never.'
      , authorBy: '-Sir Winston Churchill' },
      { quoteText: 'Giving people a little more than they expect is a good way to get back more than you would expect.'
      , authorBy: '-Robert Half' },
      { quoteText: 'Most of the things worth doing in the world had been declared impossible before they were done.'
      , authorBy: '-Louis D. Brandeis' },
      { quoteText: 'The gem cannot be polished without friction, nor man perfected without trials.'
      , authorBy: '-Chinese Proverb' },
      { quoteText: 'Courage is not the absence of fear, but the capacity to act despite our fears.'
      , authorBy: '-John McCain' },
      { quoteText: 'Think of yourself as on the threshold of unparalleled success. A whole, clear, glorious life lies before you. Achieve! Achieve!'
      , authorBy: '-Andrew Carnegie' },
      { quoteText: 'Focus on the little things and the big things will take care of themselves.'
      , authorBy: '-Joe Paterno' },
      { quoteText: 'Strength does not come from winning. Your struggles develop your strength. When you go through hardship and decide not to surrender, that is strength.'
      , authorBy: '-Arnold Schwarzenegger' },
      { quoteText: 'Success is not an entitlement. It has to be earned.'
      , authorBy: '-Howard Schultz' },
      { quoteText: 'You gain strength, courage and confidence by every experience in which you really stop to look fear in the face. You must do the thing you think you cannot do.'
      , authorBy: '-Eleanor Roosevelt' },
      { quoteText: 'Most of our obstacles would melt away if, instead of cowering before them, we should make up our minds to walk boldly through them.'
      , authorBy: '-Orison Swett Marden' },
      { quoteText: 'To accomplish great things, we must not only act, but also dream, not only plan, but also believe.'
      , authorBy: '-Anatole France' },
      { quoteText: 'People become really quite remarkable when they start thinking that they can do things. When they believe in themselves they have the first secret of success.'
      , authorBy: '-Norman Vincent Peale' },
      { quoteText: 'Nothing splendid has ever been achieved except by those who dared believe that something inside them was superior to circumstances.'
      , authorBy: '-Bruce Barton' },
      { quoteText: 'Formulate and stamp indelibly on your mind a mental picture of yourself as succeeding. Hold this picture tenaciously and never permit it to fade. Your mind will seek to develop this picture!'
      , authorBy: '-Dr. Norman Vincent Peale' },
      { quoteText: 'Always do what you are afraid to do.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'What you do speaks so loudly that I cannot hear what you say.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'Obstacles do not have to stop you. If you run into a wall, do not turn around and give up. Figure out how to climb it, go through it, or work around it.'
      , authorBy: '-Michael Jordan' },
      { quoteText: 'A person must not deny their manifest abilities, for that is to evade their obligations.'
      , authorBy: '-Robert Louis Stephenson' },
      { quoteText: 'Success is liking yourself, liking what you do, and liking how you do it.'
      , authorBy: '-Maya Angelou' },
      { quoteText: 'Do not judge each day by the harvest you reap, but by the seeds you plant.'
      , authorBy: '-Robert Louis Stevenson' },
      { quoteText: 'Forget about the consequences of failure. Failure is only a temporary change in direction to set you straight for your next success.'
      , authorBy: '-Denis Waitley' },
      { quoteText: 'When one door of happiness closes, another opens; but often we look so long at the closed door that we do not see the one which has been opened for us.'
      , authorBy: '-Helen Keller' },
      { quoteText: 'No success is linear, there will always be bumps in the road.'
      , authorBy: '-Jack Welch' },
      { quoteText: 'I know of no more encouraging fact than the unquestionable ability of man to elevate himself through conscious endeavor.'
      , authorBy: '-Dale Carnegie' },
      { quoteText: 'Iron rusts from disuse, stagnant water loses its purity, and in cold weather becomes frozen: even so does inaction sap the vigors of the mind.'
      , authorBy: '-Leonardo da Vinci' },
      { quoteText: 'I was always looking outside myself for strength and confidence, but it comes from within. It is there all the time.'
      , authorBy: '-Anna Freud' },
      { quoteText: 'Patience and perseverance have a magical effect before which difficulties disappear and obstacles vanish.'
      , authorBy: '-John Quincy Adams' },
      { quoteText: 'Pessimism leads to weakness, optimism to power.'
      , authorBy: '-William James' },
      { quoteText: 'Time is limited, so I better wake up every morning fresh and know that I have just one chance to live this particular day right, and to string my days together into a life of action, and purpose.'
      , authorBy: '-Lance Armstrong' },
      { quoteText: 'A leader leads through inspiration. People like to work with people going places and are starved for the energy and excitement that business was always meant to have.'
      , authorBy: '-Loral Langemeier' },
      { quoteText: 'Every now and then go away, have a little relaxation, for when you come back to your work your judgment will be surer. Go some distance away because then the work appears smaller and more of it can be taken in at a glance and a lack of harmony and proportion is more readily seen.'
      , authorBy: '-Leonardo Da Vinci' },
      { quoteText: 'Sometimes you have got to let everything go...purge yourself. If you are unhappy with anything...whatever is bringing you down, get rid of it. Because you will find that when you are free, your true creativity, your true self comes out.'
      , authorBy: '-Tina Turner' },
      { quoteText: 'Knowing when to keep your mouth shut is invariably more important than opening it at the right time.'
      , authorBy: '-Malcolm Forbes' },
      { quoteText: 'One who fears failure limits his activities.'
      , authorBy: '-Henry Ford' },
      { quoteText: 'There are no secrets to success: do not waste time looking for them. Success is the result of perfection, hard work, learning from failure, loyalty to those for whom you work, and persistence.'
      , authorBy: '-Colin Powell' },
      { quoteText: 'I shall pass through this world but once. Any good, therefore, that I can do or any kindness that I can show to any human being, let me do it now. Let me not defer nor neglect it, for I shall not pass this way again!'
      , authorBy: '-Jerry Lewis' },
      { quoteText: 'When plans are laid in advance, it is surprising how often the circumstances fit in with them.'
      , authorBy: '-Sir William Osler' },
      { quoteText: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.'
      , authorBy: '-Benjamin Franklin' },
      { quoteText: 'Why not go out on a limb? Is not that where the fruit is?'
      , authorBy: '-Frank Scully' },
      { quoteText: 'A stumbling block to the pessimist is a stepping stone to the optimist.'
      , authorBy: '-Eleanor Roosevelt' },
      { quoteText: 'It is not the straining for great things that is most effective; it is the doing of the little things, the common duties, a little better and better.'
      , authorBy: '-Elizabeth Stuart Phelps' },
      { quoteText: 'The will to win is important, but the will to prepare is vital.'
      , authorBy: '-Joe Paterno' },
      { quoteText: 'Pressure is a word that is misused in our vocabulary. When you start thinking of pressure, it is because you have started to think of failure.'
      , authorBy: '-Tommy Lasorda' },
      { quoteText: 'There are some things which cannot be learned quickly, and time, which is all we have, must be paid heavily for their acquiring. They are the very simplest things, and because it takes a mans life to know them the little new that each man gets from life is very costly and the only heritage he has to leave.'
      , authorBy: '-Ernest Hemingway' },
      { quoteText: 'My father used to say to me, Whenever you get into a jam, whenever you get into a crisis or an emergency...become the calmest person in the room and you will be able to figure your way out of it.'
      , authorBy: '-Rudolph Giuliani' },
      { quoteText: 'It is not the straining for great things that is most effective; it is the doing of the little things, the common duties, a little better and better.'
      , authorBy: '-Elizabeth Stuart Phelps' },
      { quoteText: 'Learn to smile at every situation. See it as an opportunity to prove your strength and ability.'
      , authorBy: '-Joe Brown' },
      { quoteText: 'The real contest is always between what you have done and what you are capable of doing. You measure yourself against yourself and nobody else.'
      , authorBy: '-Geoffrey Gaberino' },
      { quoteText: 'We must not, in trying to think about how we can make a big difference, ignore the small daily differences we can make which, over time, add up to big differences that we often cannot foresee.'
      , authorBy: '-Marian Wright Edelman' },
      { quoteText: 'Effective leadership is putting first things first. Effective management is discipline, carrying it out.'
      , authorBy: '-Stephen Covey' },
      { quoteText: 'You can not have a better tomorrow if you are thinking about yesterday all the time.'
      , authorBy: '-Charles F. Kettering' },
      { quoteText: 'The roots of true achievement lie in the will to become the best that you can become.'
      , authorBy: '-Harold Taylor' },
      { quoteText: 'Most of the important things in the world have been accomplished by people who have kept on trying when there seemed to be no help at all.'
      , authorBy: '-Dale Carnegie' },
      { quoteText: 'Learn to smile at every situation. See it as an opportunity to prove your strength and ability.'
      , authorBy: '-Joe Brown' },
      { quoteText: 'Do not spend your precious time asking Why is not the world a better place? It will only be time wasted. The question to ask is How can I make it better? To that there is an answer.'
      , authorBy: '-Leo Buscaglia' },
      { quoteText: 'The past cannot be regained, although we can learn from it; the future is not yet ours even though we must plan for it. Time is now. We have only today.'
      , authorBy: '-Charles Hummell' },
      { quoteText: 'There are no limitations to the mind except those we acknowledge; both poverty and riches are the offspring of thought.'
      , authorBy: '-Napoleon Hill' },
      { quoteText: 'He that does good for goods sake seeks neither paradise nor reward, but he is sure of both in the end.'
      , authorBy: '-William Penn' },
      { quoteText: 'Because many professionals are almost always successful at what they do, they rarely experience failure. And because they have rarely failed, they have never learned how to learn from failure.'
      , authorBy: '-Chris Argyris' },
      { quoteText: 'Take a chance! All life is a chance. The person who goes the furthest is generally the one who is willing to do and dare.'
      , authorBy: '-Dale Carnegie' },
      { quoteText: 'It seems clear to me that in an enterprise, if everybody concerned is absolutely clear about the goals and objectives and far purposes of the organization, practically all other questions then become simple technical questions of fitting means to the ends.'
      , authorBy: '-Abraham Maslow' },
      { quoteText: 'You can not think your way out of a box; you have got to act.'
      , authorBy: '-Tom Peters' },
      { quoteText: 'The wise man thinks about his troubles only when there is some purpose in doing so; at other times he thinks about other things.'
      , authorBy: '-Bertrand Russell' },
      { quoteText: 'Success is going from failure to failure without losing enthusiasm.'
      , authorBy: '-Winston Churchill' },
      { quoteText: 'Confront the dark parts of yourself, and work to banish them with illumination and forgiveness. Your willingness to wrestle with your demons will cause your angels to sing. Use the pain as fuel, as a reminder of your strength.'
      , authorBy: '-August Wilson' },
      { quoteText: 'Like an ability or muscle, hearing your inner wisdom is strengthened by doing it.'
      , authorBy: '-Robbie Gass' },
      { quoteText: 'The foolish man seeks happiness in the distance; the wise grows it under his feet.'
      , authorBy: '-James Oppenheim' },
      { quoteText: 'When you can do the common things of life in an uncommon way you will command the attention of the world.'
      , authorBy: '-George Washington Carver' },
      { quoteText: 'I know of no more encouraging fact than the unquestionable ability of man to elevate his life by conscious endeavor.'
      , authorBy: '-Henry David Thoreau' },
      { quoteText: 'A hero is an ordinary individual who finds the strength to persevere and endure in spite of overwhelming obstacles.'
      , authorBy: '-Christopher Reeve' },
      { quoteText: 'Learn from the past, live in the now and be optimistic about the future.'
      , authorBy: '-Anonymous' },
      { quoteText: 'Here is a test to find out whether your mission on earth is finished: If you are alive, it is not!'
      , authorBy: '-Richard Bach' },
      { quoteText: 'It is mans foremost duty to awaken the understanding of the inner self and to know his own real inner greatness. Once he knows his true worth, he can know the worth of others.'
      , authorBy: '-Swami Muktananda' },
      { quoteText: 'We can achieve what we can conceive and believe.'
      , authorBy: '-Mark Twain' },
      { quoteText: 'The trouble with most people is that they think with their hopes or fears or wishes rather than with their minds.'
      , authorBy: '-Will Durant' },
      { quoteText: 'Consider the postage stamp...It secures success through its ability to stick to one thing until it gets there.'
      , authorBy: '-Josh Billings' },
      { quoteText: 'All great masters are chiefly distinguished by the power of adding a second, a third, and perhaps a fourth step in a continuous line. Many a man had taken the first step. With every additional step you enhance immensely the value of you first.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'It is inevitable that some defeat will enter even the most victorious life. The human spirit is never finished when it is defeated... it is finished when it surrenders.'
      , authorBy: '-Ben Stein' },
      { quoteText: 'There is no royal road to anything. One thing at a time, all things in succession. That which grows fast, withers as rapidly. That which grows slowly, endures.'
      , authorBy: '-Josiah Gilbert Holland' },
      { quoteText: 'So many of our dreams at first seem impossible, then they seem improbable, and then when we summon the will, they soon become inevitable.'
      , authorBy: '-Christopher Reeve' },
      { quoteText: 'If you want to be prosperous for a year, grow grain. If you want to be prosperous for ten years, grow trees. If you want to be prosperous for a lifetime, grow people.'
      , authorBy: '-Proverb' },
      { quoteText: 'Slow down and enjoy life. It is not only the scenery you miss by going too fast, you also miss the sense of where you are going and why.'
      , authorBy: '-Eddie Cantor' },
      { quoteText: 'Circumstances may cause interruptions and delays, but never lose sight of your goal. Prepare yourself in every way you can by increasing your knowledge and adding to your experience, so that you can make the most of opportunity when it occurs.'
      , authorBy: '-Mario Andretti' },
      { quoteText: 'Every good thing flows from the attitude of respect. For this reason, the most important action you can perform is to welcome yourself and others with respect and love.'
      , authorBy: '-Baba Muktananda' },
      { quoteText: 'Your PURPOSE explains WHAT you are doing with your life. Your VISION explains how you are living your PURPOSE. Your GOALS enable you to realize your VISION.'
      , authorBy: '-Bob Proctor' },
      { quoteText: 'A person of power embraces challenges in complete gratitude. No matter the situation life may bring, discontent is never justified, rather all is experienced as an opportunity and a privilege to adventure and grow.'
      , authorBy: '-James Ray' },
      { quoteText: 'Courage means to keep working a relationship, to continue seeking solutions to difficult problems, and to stay focused during stressful periods.'
      , authorBy: '-Denis Waitley' },
      { quoteText: 'The greatest weapon against stress is our ability ...'
      , authorBy: '-William James' },
      { quoteText: 'Never doubt that a small group of thoughtful, committed citizens can change the world. Indeed, it is the only thing that ever has.'
      , authorBy: '-Margaret Mead' },
      { quoteText: 'When you make a mistake, do not look back at it long. Take the reason of the thing into your mind, and then look forward. Mistakes are lessons of wisdom. The past cannot be changed. The future is yet in your power.'
      , authorBy: '-Phyllis Bottome' },
      { quoteText: 'Start by doing what is necessary, then what is possible, and suddenly you are doing the impossible.'
      , authorBy: '-St. Francis of Assisi' },
      { quoteText: 'Never measure the height of a mountain until you have reached the top. Then you will see how low it was.'
      , authorBy: '-Dag Hammarskjold' },
      { quoteText: 'Believing in fate produces fate. Believing in freedom will create infinite possibilities.'
      , authorBy: '-Ayn Rand' },
      { quoteText: 'The truest greatness lies in being kind, the truest wisdom in a happy mind.'
      , authorBy: '-Ella Wheeler Wilcox' },
      { quoteText: 'Too often we underestimate the power of a touch, a smile, a kind word, a listening ear, an honest compliment, or the smallest act of caring, all of which have the potential to turn a life around.'
      , authorBy: '-Leo Buscaglia' },
      { quoteText: 'Everything that happens, happens as it should, and if you observe carefully, you will find this to be true.'
      , authorBy: '-Marcus Aurelius' },
      { quoteText: 'Feeling gratitude and not expressing it is like wrapping a present and not giving it.'
      , authorBy: '-William Arthur Ward' },
      { quoteText: 'Find your true path. It is so easy to become someone we do not want to be, without even realizing it is happening.'
      , authorBy: '-Bernie Siegel' },
      { quoteText: 'You can not escape the responsibility of tomorrow by evading it today.'
      , authorBy: '-Abraham Lincoln' },
      { quoteText: 'Failure is a part of success. There is no such thing as a bed of roses all your life. But failure will never stand in the way of success if you learn from it.'
      , authorBy: '-Hank Aaron' },
      { quoteText: 'I have failed over and over and over again in my life. And that is why I succeed.'
      , authorBy: '-Michael Jordan' },
      { quoteText: 'Remember not only to say the right thing in the right place, but far more difficult still, to leave unsaid the wrong thing at the tempting moment.'
      , authorBy: '-Benjamin Franklin' },
      { quoteText: 'No one ever attains very eminent success by simply doing what is required of him; it is the amount and excellence of what is over and above the required that determines the greatness of ultimate distinction.'
      , authorBy: '-Charles Kendall Adams' },
      { quoteText: 'You can learn new things at any time in your life if you are willing to be a beginner. If you actually learn to like being a beginner, the whole world opens up to you.'
      , authorBy: '-Barbara Sher' },
      { quoteText: 'Security is mostly a superstition. It does not exist in nature, nor do the children of men as a whole experience it. Avoiding danger is no safer in the long run than outright exposure. Life is either a daring adventure, or nothing.'
      , authorBy: '-Helen Keller' },
      { quoteText: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.'
      , authorBy: '-Ralph Waldo Emerson' },
      { quoteText: 'Our goals can only be reached through a vehicle of a plan, in which we must fervently believe, and upon which we must vigorously act. There is no other route to success.'
      , authorBy: '-Stephen A. Brennan' },
      { quoteText: 'The goal you set must be challenging. At the same time, it should be realistic and attainable, not impossible to reach. It should be challenging enough to make you stretch, but not so far that you break.'
      , authorBy: '-Rick Hansen' },
      { quoteText: 'Good humor is a tonic for mind and body. It is the best antidote for anxiety and depression. It is a business asset. It attracts and keeps friends. It lightens human burdens. It is the direct route to serenity and contentment.'
      , authorBy: '-Grenville Kleiser' }
      
      ], function(err, res){
      return err? cb(err): cb();
    });
  }], function(err, result){
    if(err){
      console.log('error initializing mongodb, please try again.');
      process.exit(-1);
    }
    return workflow.emit('generateConfigJS');
  });
});

workflow.on('generateConfigJS', function(){
  async.waterfall([
    function(cb){
      // retrieve config.example.js from file system
      require('fs').readFile('./config.example.js', {encoding: 'utf8'}, function(err, data){
        return err? cb(err): cb(null, data);
      });
    },
    function(content, cb){
      // find and replace with information collected
      var smtpEnabled = !!workflow.smtp.password;
      var map = {
        '{{MONGO_URI}}': workflow.mongo.uri,
        '{{ADMIN_EMAIL}}': workflow.admin.email,
        '{{SMTP_EMAIL}}': smtpEnabled? workflow.smtp.email: '',
        '{{SMTP_PASSWORD}}': smtpEnabled? workflow.smtp.password: '',
        '{{SMTP_HOST}}': smtpEnabled? workflow.smtp.host: ''
      };
      for(var key in map){
        if(map.hasOwnProperty(key)){
          content = content.replace(new RegExp(key, 'g'), map[key]);
        }
      }
      cb(null, content);
    },
    function(content, cb){
      // output config.js back to filesystem
      require('fs').writeFile('./config.js', content, function(err, res){
        return err? cb(err): cb();
      });
    }
  ], function(err, result){
    if(err){
      console.log('error generating config.js.');
      process.exit(-1);
    }
    return workflow.emit('complete');
  });
});

workflow.on('complete', function(){
  if(workflow.db){
    workflow.db.close();
  }
  console.log('=====Angular-Drywall initialization complete=====');
  process.exit(0);
});

workflow.emit('collectUserInput');
